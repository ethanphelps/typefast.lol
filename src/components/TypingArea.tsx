import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TypingMode, TypingModes } from '../models/models';
import WordComponent from './Word';
import { ModeState } from '../reducers/mode-reducer';
import { ExerciseDispatchInput, ExerciseState, ExerciseStatus, TypingActions, WordData, computeRowStartIndices, computeWordRenderMap, setAllWordsToRender, typedWord } from '../reducers/exercise-reducer';
import * as Logger from "../utils/logger";
import { IconButton } from './IconButton';
import { CopyText } from '../inline-svgs';
import { Tooltip } from './Tooltip';

const deleteInputTypes: Set<String> = new Set(['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward']);
export const ROW_SPAN = 3;
const TYPING_AREA_MIN_HEIGHT = 76;
const BUFFER = 5;
const WORD_RETRIEVAL_THRESHOLD = 4;


interface TypingAreaProps {
    state: ExerciseState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, ExerciseDispatchInput>>>;
    modeState: ModeState;
}
// should mode state be passed together as one prop value or as individual prop values?
export const TypingArea = ({
    state,
    dispatch,
    modeState,
}: TypingAreaProps): React.ReactElement => {
    const inputRef = useRef<HTMLInputElement>(null);
    const typingDisplay = useRef<HTMLDivElement>(null);

    const [rowOffset, setRowOffset] = useState<number>(0);
    const [rowStartIndices, setRowStartIndices] = useState<number[]>(null);

    if(state.status === ExerciseStatus.READY && rowOffset > 0) {
        setRowOffset(0);
    }

    /**
     * Executes before first paint, but after DOM has computed layout for all words:
     * Compute row starts
     * Compute word render map
     * 
     * Should be retriggered every time a layout shift happens. 
     */
    useLayoutEffect(() => {
        const currentHeight = typingDisplay.current?.clientHeight;
        if(
            !state.recalculateRows && 
            Math.floor(currentHeight) > Math.floor(TYPING_AREA_MIN_HEIGHT) + BUFFER && 
            (state.status === ExerciseStatus.READY || state.status === ExerciseStatus.IN_PROGRESS)
        ) {
            Logger.debug(`Layout shift has occurred! current height: ${currentHeight}, desired height: ${TYPING_AREA_MIN_HEIGHT}`);
            dispatch({ type: TypingActions.LAYOUT_SHIFT });
        }
        if(state.recalculateRows) {
            const newRowStartIndices = computeRowStartIndices(typingDisplay, state);
            Logger.debug("USE LAYOUT EFFECT. NEW ROW START INDICES: ", newRowStartIndices);
            Logger.debug("USE LAYOUT EFFECT. OLD ROW START INDICES: ", rowStartIndices);
            if(layoutChanged(rowStartIndices, newRowStartIndices)) {
                Logger.log('Layout CHANGED');
                setRowStartIndices(newRowStartIndices);
            }
            dispatch({ type: TypingActions.LAYOUT_SHIFT_COMPLETED });
        }
        Logger.debug('typingDisplay during useLayoutEffect: ', typingDisplay.current?.clientHeight);
    })

    Logger.debug('typingDisplay during render: ', typingDisplay.current?.clientHeight);
    Logger.debug(`rowOffset: ${rowOffset}`);
    if(!lastTwoRows(rowStartIndices, state.currentWord, rowOffset) && middleRowComplete(rowStartIndices, state.currentWord, rowOffset)) {
        setRowOffset(rowOffset + 1);
    }

    if(shouldGetMoreWords(modeState.mode, state, rowStartIndices)) {
        dispatch({
            type: TypingActions.GET_MORE_WORDS,
            payload: { modeState: modeState }
        });
        dispatch({ type: TypingActions.LAYOUT_SHIFT });
    }

    let wordRenderMap: Record<number, string> = null;
    if(
        typingDisplay.current && 
        rowStartIndices && 
        !state.recalculateRows &&
        (state.status === ExerciseStatus.READY || state.status === ExerciseStatus.IN_PROGRESS)
    ) {
        wordRenderMap = computeWordRenderMap(rowStartIndices, rowOffset, state.words);
        // Logger.debug('word render map: ', wordRenderMap);
    } else {
        Logger.debug('setting all words to render');
        wordRenderMap = setAllWordsToRender(state.words);
    }


    /**
     * Focus invisible input and register ResizeObserver for detecting layout shifts after first render
     */
    useEffect(() => {
        inputRef.current.focus();
    }, [])

    /**
     * critical logic for making backspace to previous words work!
     */
    useEffect(() => {
        /**
         * check if exercise in progress
         * if key === backspace and input element's value is empty, then dispatch PREVIOUS_WORD
         * 
         * MOVING PREVIOUS_WORD DISPATCH HERE FROM HANDLEBEFOREINPUT FIXED SAFARI FORCE RELOAD BUG!!!
         * TODO: maybe combine CHARACTER_DELETED and PREVIOUS_WORD into one reducer action
         * TODO: re-evaluate if this event listener really needs to be reassigned on every state update?? - may need to be reassigned since state would be stale if only assigned once
         * TODO: see if this can be extracted from useEffect and just run during render? may cause off-by-one issues
         */
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (state.status === ExerciseStatus.IN_PROGRESS || state.status === ExerciseStatus.READY) {
                inputRef.current.focus();
            }

            if (
                state.status === ExerciseStatus.IN_PROGRESS &&
                state.currentWord > rowStartIndices[rowOffset] &&
                state.currentWord < state.words.length &&
                isBackspace(event) &&
                state.wordData[state.currentWord].typedCharArray.length == 0
            ) {
                dispatch({
                    type: TypingActions.PREVIOUS_WORD
                });
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [state]);


    const isDeleteInputType = (event: InputEvent): boolean => {
        return deleteInputTypes.has(event.inputType);
    }

    const isDelete = (event: React.ChangeEvent, inputValue: string): boolean => {
        return isDeleteInputType(event.nativeEvent as InputEvent) || inputValue.length < state.wordData[state.currentWord].typedCharArray.length;
    }

    const handleDeletion = (inputValue: string) => {
        if (typedWord(state).length === 0) {
            return; // TODO: figure out if this is still needed
        }
        if (deletingExtraCharacter(state)) {
            dispatch({ type: TypingActions.LAYOUT_SHIFT });
        }
        dispatch({
            type: TypingActions.CHARACTER_DELETED,
            payload: {
                inputValue: inputValue,
            }
        });
    }

    const handleWordComplete = (inputValue: string) => {
        dispatch({
            type: TypingActions.WORD_COMPLETE,
            payload: {
                inputValue: inputValue,
                mode: modeState.mode
            },
        })
        if (checkEndOfExercise(state, modeState)) {
            dispatch({
                type: TypingActions.EXERCISE_COMPLETE,
                payload: {
                    mode: modeState.mode
                }
            });
        }
    }

    const handleInput = (event: React.ChangeEvent) => {
        if (state.currentWord >= state.words.length || !state.canType || earlySpace(state, event)) {
            return;
        }

        const inputValue = (event.target as HTMLInputElement).value;

        if (!state.typingStarted) {
            dispatch({
                type: TypingActions.TYPING_STARTED,
                payload: {
                    modeState: modeState,
                    dispatch: dispatch
                }
            });
        }

        if (isDelete(event, inputValue)) {
            handleDeletion(inputValue.trim()); // .trim() to fix safari bug not deleting space when going to previous word. see if any reason not to trim(). 
            return;
        }

        if (inputValue.length > 0) {
            if (!wordStarted(state)) {
                dispatch({
                    type: TypingActions.WORD_STARTED
                })
            }

            dispatch({
                type: TypingActions.CHARACTER_TYPED,
                payload: {
                    inputValue: inputValue,
                }
            });
        }

        const characterTyped = inputValue[inputValue.length - 1];
        if (shouldMoveToNextWord(inputValue, characterTyped) || endAfterLastCharacter(state, inputValue)) {
            handleWordComplete(inputValue.trim());
        }
    }

    const copyExerciseText = async (): Promise<void> => {
        try {
            const text = state.words.join(' ');
            await navigator.clipboard.writeText(text);
        } catch(e) {
            Logger.error(`Failed to copy exercise text.`, e);
        }
    }


    return (
        <div className="typing-container typefast-card">

            <article id="typing-display" ref={typingDisplay} style={{ minHeight: JSON.stringify(TYPING_AREA_MIN_HEIGHT)}}>
                {
                    state.wordData
                        ? state.wordData
                            .map((data: WordData, index: number) => {
                                return <WordComponent
                                    word={data.wordCharArray}
                                    typedWord={data.typedCharArray}
                                    wordIndex={data.id}
                                    currentWord={state.currentWord}
                                    renderClass={wordRenderMap[index]}
                                    key={data.id}
                                />
                            })
                        : null
                }
            </article>

            { state.status === ExerciseStatus.COMPLETE ? 
                <div id="copy-text-container">
                    <Tooltip text="copy">
                        <IconButton image={<CopyText/>} onClick={copyExerciseText}/>
                    </Tooltip>
                </div>
                : <></>
            }

            <input
                id="invisible-input"
                type="text"
                value={getInvisibleInputElementValue(state)}
                onChange={handleInput}
                ref={inputRef}
                autoComplete='off'
                autoCapitalize='off'
                autoCorrect='off'
                data-gramm='false'
                data-gramm_editor='false'
                data-enable-grammarly='false'
                spellCheck='false'
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
            >
            </input>
        </div>
    );
}


/**
 * Returns true for generating more words if we're in a mode that needs incremental word generation and
 * the current word index is within the last number of rows considered the threshold (should be last four)
 */
const shouldGetMoreWords = (mode: TypingMode, state: ExerciseState, rowStartIndices: number[]): boolean => {
    Logger.debug(`Index at which to get more words: ${rowStartIndices?.[rowStartIndices.length - WORD_RETRIEVAL_THRESHOLD]}`);
    if(
        mode === TypingModes.TIMED && 
        rowStartIndices !== null &&
        state.currentWord >= rowStartIndices[rowStartIndices.length - WORD_RETRIEVAL_THRESHOLD]
    ) {
        return true;
    }
    return false;
}

/**
 * Want to dispatch LAYOUT_SHIFT when deleting extra characters since this could cause previously displaced words to come
 * back to the bottom visible row
 */
const deletingExtraCharacter = (state: ExerciseState): boolean => {
    return state.wordData[state.currentWord].typedCharArray.length > state.wordData[state.currentWord].wordCharArray.length;
}

const middleRowComplete = (rowStartIndices: number[], currentWord: number, rowOffset: number): boolean => {
    return currentWord >= rowStartIndices?.[rowOffset + ROW_SPAN - 1];
}

/**
 * Returns true if on last two rows and they're both in view or if total number of rows <= 3
 */
const lastTwoRows = (rowStartIndices: number[], currentWord: number, rowOffset: number): boolean => {
    Logger.debug(`lastTwoRows - rowStartIndices: ${JSON.stringify(rowStartIndices)}, currentWord: ${currentWord}`);
    if(!rowStartIndices || rowStartIndices.length <= 3) {
        return true;
    }
    return currentWord >= rowStartIndices[rowStartIndices.length - 2] && rowOffset + ROW_SPAN >= rowStartIndices.length;
}

const layoutChanged = (oldIndices: number[], newIndices: number[]): boolean => {
    if(!oldIndices) {
        return true;
    }
    if(oldIndices.length !== newIndices.length) {
        return true;
    }
    for(let i = 0; i < oldIndices.length; i++) {
        if(oldIndices[i] !== newIndices[i]) {
            return true;
        }
    }
    return false;
}

const earlySpace = (state: ExerciseState, event: React.ChangeEvent): boolean => {
    return (event.nativeEvent as InputEvent).data === " " && state.wordData[state.currentWord].typedCharArray.length === 0;
}

const getInvisibleInputElementValue = (state: ExerciseState): string => {
    let returnValue;
    if (state.wordData[state.currentWord]?.typedCharArray.length > 0) {
        returnValue = state.wordData[state.currentWord]?.typedCharArray.join('') || "";
    } else {
        returnValue = " ";
    }
    // Logger.log(`getInvisibleInputElementValue: "${returnValue}"`);
    return returnValue;
}

const endAfterLastCharacter = (state: ExerciseState, inputValue: string): boolean => {
    return state.currentWord + 1 === state.words.length && inputValue.trim() === state.words[state.currentWord];
}

const checkEndOfExercise = (exerciseState: ExerciseState, modeState: ModeState): boolean => {
    if (modeState.mode === TypingModes.FIXED || modeState.mode === TypingModes.QUOTES || modeState.mode === TypingModes.PRACTICE) {
        return exerciseState.currentWord + 1 >= exerciseState.words.length;
    } else if (modeState.mode === TypingModes.TIMED) {
        return false;
    }
}

const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}


export const getWordDataList = (selectedWords: string[], indexOffset: number = 0): WordData[] => {
    if (!selectedWords) {
        return [];
    }
    const data: WordData[] = selectedWords.map((word: string, index: number) => {
        return {
            id: index + indexOffset,
            word: word,
            wordCharArray: word.split(''),
            typedCharArray: [],
            attempts: [],
            cssClass: "",
            mistyped: false,
            startTime: null,
            endTime: null,
            wpm: null
        }
    });
    return data;
}

const isBackspace = (event: KeyboardEvent): boolean => {
    return event.key === 'Backspace' || event.key === 'delete';
}

const wordStarted = (state: ExerciseState): boolean => {
    return state.wordData[state.currentWord].typedCharArray.length > 0;
}