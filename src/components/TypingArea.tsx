import React, { useEffect, useRef } from 'react';
import { TypingModes } from '../models/models';
import WordComponent from './Word';
import { ModeState } from '../reducers/mode-reducer';
import { ExerciseDispatchInput, ExerciseState, ExerciseStatus, TypingActions, WordData, typedWord } from '../reducers/exercise-reducer';
import * as Logger from "../utils/logger";

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];



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

    useEffect(() => {
        inputRef.current.focus();
    }, [])


    Logger.log(`currentWord: ${state.currentWord}`);
    Logger.log(`typedWord.length: `, state.wordData[state.currentWord]);


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
         */
        const handleKeyDown = (event: KeyboardEvent): void => {
            Logger.log('keydown');
            if(state.status === ExerciseStatus.IN_PROGRESS || state.status === ExerciseStatus.READY) {
                inputRef.current.focus();
            }

            if(
                state.status === ExerciseStatus.IN_PROGRESS && 
                state.currentWord > 0 && 
                state.currentWord < state.words.length && 
                isBackspace(event) && 
                state.wordData[state.currentWord].typedCharArray.length == 0
            ) {
                Logger.log("PREVIOUS_WORD");
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
        Logger.log(event.inputType);
        return deleteInputTypes.includes(event.inputType);
    }

    const isDelete = (event: React.ChangeEvent, inputValue: string): boolean => {
        return isDeleteInputType(event.nativeEvent as InputEvent) || inputValue.length < state.wordData[state.currentWord].typedCharArray.length;
    }

    const handleDeletion = (inputValue: string) => {
        if (typedWord(state).length === 0) {
            return;
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

        Logger.log(`handleInput: "${inputRef.current.value}"`);
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

        if(inputValue.length > 0) {
            Logger.log("input triggered a state update");
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

    return (
        <div className="typing-container typefast-card">
            <article className="typing-display">
                {
                    state.wordData
                        ? state.wordData.map((data: WordData, index: number) => {
                            return <WordComponent
                                word={data.wordCharArray}
                                typedWord={data.typedCharArray}
                                wordIndex={data.id}
                                currentWord={state.currentWord}
                                key={data.id}
                            />
                        })
                        : null
                }
            </article>
            <input
                id="invisible-input"
                type="text"
                value={getInvisibleInputElementValue(state)} 
                onChange={handleInput} 
                // onInput={handleInput} 
                ref={inputRef}
                autoComplete='off'
                autoCapitalize='off'
                autoCorrect='off'
                data-gramm='false'
                data-gramm_editor='false'
                data-enable-grammarly='false'
                spellCheck='false'
            >
            </input>
        </div>
    );
}

const earlySpace = (state: ExerciseState, event: React.ChangeEvent): boolean => {
    return (event.nativeEvent as InputEvent).data === " " && state.wordData[state.currentWord].typedCharArray.length === 0;
}

const getInvisibleInputElementValue = (state: ExerciseState): string => {
    let returnValue;
    if(state.wordData[state.currentWord]?.typedCharArray.length > 0) {
        returnValue = state.wordData[state.currentWord]?.typedCharArray.join('') || "";
    } else  {
        returnValue = " ";
    }
    Logger.log(`getInvisibleInputElementValue: "${returnValue}"`);
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


export const getWordDataList = (selectedWords: string[]): WordData[] => {
    if (!selectedWords) {
        return [];
    }
    const data: WordData[] = selectedWords.map((word: string, index: number) => {
        return {
            id: index,
            word: word,
            wordCharArray: word.split(''),
            typedCharArray: [],
            incorrectAttempts: [],
            cssClass: "",
            mistyped: false
        }
    });
    data[0] = { ...data[0], cssClass: "highlighted" };
    return data;
}

const isBackspace = (event: KeyboardEvent): boolean => {
    Logger.log(event);
    return event.key === 'Backspace' || event.key === 'delete';
}