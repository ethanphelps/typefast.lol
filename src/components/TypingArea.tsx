import React, { useEffect, useState, Suspense, ReactHTML, useReducer, useMemo, useRef } from 'react';
import { ObjectValues, TypingMode, FixedWordExerciseLength, TypingModes } from '../models/models';
import { WordsSource } from '../services/words/words.interface';
import WordsService from '../services/words/words-service';
import WordComponent from './Word';
import { ModeState } from '../reducers/mode-reducer';
import { DispatchInput, ExerciseState, TypingActions, WordData, handleKeyDown, typedWord } from '../reducers/exercise-reducer';

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];



interface TypingAreaProps {
    state: ExerciseState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, DispatchInput>>>;
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
        const focusInputElement = (event: KeyboardEvent) => {
            inputRef.current.focus();
        }
        document.addEventListener('keydown', focusInputElement);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', focusInputElement);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [])


    /**
     * critical logic for making backspace to previous words work!
     */
    useEffect(() => {
        console.debug("input.value: ", `"${inputRef.current.value}"`);
        const handleBeforeInput = (event: InputEvent) => {
            if (state.currentWord > 0 && state.currentWord < state.words.length && isDeleteInputType(event) && state.wordData[state.currentWord].typedCharArray.length == 0) {
                dispatch({
                    type: TypingActions.PREVIOUS_WORD
                })
            }
        }
        inputRef.current.addEventListener('beforeinput', handleBeforeInput);
        return () => {
            inputRef.current.removeEventListener('beforeinput', handleBeforeInput);
        }
    }, [state]);


    const isDeleteInputType = (event: InputEvent): boolean => {
        return deleteInputTypes.includes(event.inputType);
    }

    const isDelete = (event: React.ChangeEvent, inputValue: string): boolean => {
        return isDeleteInputType(event.nativeEvent as InputEvent) || inputValue.length < state.wordData[state.currentWord].typedCharArray.length;
    }

    // TODO: change this logic to handle going backwards to other words
    const handleDeletion = (inputValue: string) => {
        console.debug('DELETE');
        // TODO: handle going backwards to other words here
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

    // TODO: transition this to a KeyDown handler (maybe, may not need to)
    const handleInput = (event: React.ChangeEvent) => {
        if (state.currentWord >= state.words.length || !state.canType) {
            return;
        }
        if (!state.typingStarted) {
            dispatch({
                type: TypingActions.TYPING_STARTED, // TODO: only trigger typing started if the character typed is a letter/number/symbol
                payload: {
                    modeState: modeState,
                    dispatch: dispatch
                }
            });
        }
        const inputValue = (event.target as HTMLInputElement).value;

        if (isDelete(event, inputValue)) {
            handleDeletion(inputValue);
            return; // should we return here?
        }

        dispatch({
            type: TypingActions.CHARACTER_TYPED,
            payload: {
                inputValue: inputValue,
            }
        });

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
            {/* <div className="input-row"> */}
                <input
                    id="invisible-input"
                    type="text"
                    value={state.wordData[state.currentWord]?.typedCharArray.join('') || ""} // may need to manage the value in a more fine-grained fasion | may conflict with handleBeforeInput behaviors
                    onChange={handleInput} // may need to reconsider how handleInput is called (may need to call on keypress instead of onChange on the input element)
                    ref={inputRef}
                >
                </input>
            {/* </div> */}
        </div>
    );
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

// TODO: add force correctness mode, but that would just affect the overall correctness, not whether you can move to the next word or not
const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}


export const getWordDataList = (selectedWords: string[]): WordData[] => {
    if(!selectedWords) {
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
