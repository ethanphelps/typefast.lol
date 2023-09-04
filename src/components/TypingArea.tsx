import React, { useEffect, useState, Suspense, ReactHTML, useReducer, useMemo, useRef } from 'react';
import { ObjectValues, TypingMode, FixedWordExerciseLength, TypingModes } from '../models/models';
import { WordsSource } from '../services/words/words.interface';
import WordsService from '../services/words/words-service';
import WordComponent from './Word';
import { ModeState } from '../reducers/mode-reducer';
import { DispatchInput, ExerciseState, TypingActions, WordData, typedWord } from '../reducers/exercise-reducer';

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];



interface TypingAreaProps {
    state: ExerciseState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, DispatchInput>>>;
    modeState: ModeState;
    wordsService: WordsService;
}
// should mode state be passed together as one prop value or as individual prop values?
export const TypingArea = ({
    state,
    dispatch,
    modeState,
    wordsService
}: TypingAreaProps): React.ReactElement => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current.focus();
    }, [])
    useEffect(() => {
        resetStates();
    }, [wordsService])

    const resetStates = () => {
        wordsService.resetRandomizedWords(modeState.wordCount);
        const newWords = wordsService.getRandomizedWords();
        dispatch({
            type: TypingActions.RESET,
            payload: {
                words: newWords,
                wordData: getWordDataList(newWords)
            }
        });
        inputRef.current.focus();
    }

    const isDelete = (event: React.ChangeEvent, inputValue: string): boolean => {
        return deleteInputTypes.includes((event.nativeEvent as InputEvent).inputType) || inputValue.length < state.wordData[state.currentWord].typedCharArray.length;
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
                inputClass: getInputClass(state.words[state.currentWord], inputValue)
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
                inputClass: getInputClass(state.words[state.currentWord], inputValue),
            }
        });

        const characterTyped = inputValue[inputValue.length - 1];
        if (shouldMoveToNextWord(inputValue, characterTyped)) {
            handleWordComplete(inputValue.trim());
        }
    }

    return (
        <div className="typing-container">
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
            <div className="input-row">
                <input
                    type="text"
                    value={state.wordData[state.currentWord]?.typedCharArray.join('') || ""}
                    className={state.inputClass}
                    onChange={handleInput}
                    ref={inputRef}
                >
                </input>
                <button type="button" className="retry-button" onClick={resetStates}>retry</button>
            </div>
        </div>
    );
}


const checkEndOfExercise = (exerciseState: ExerciseState, modeState: ModeState): boolean => {
    if (modeState.mode === TypingModes.FIXED) {
        return exerciseState.currentWord + 1 >= exerciseState.words.length;
    } else if (modeState.mode === TypingModes.TIMED) {
        return false;
    }
}

// TODO: add force correctness mode, but that would just affect the overall correctness, not whether you can move to the next word or not
const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}


/**
 * returns incremental correctness of the word as user is typing
 * TODO: use wordCharArray and typedCharArray instead of word and typed word
 */
const wordIsCorrect = (targetWord: string, typedWord: string) => {
    if (typedWord.length < targetWord.length) {
        for (let i = 0; i < typedWord.length; i++) {
            if (typedWord[i] !== targetWord[i]) {
                return false;
            }
        }
        return true;
    }
    return typedWord.trim() === targetWord;
}

const getInputClass = (word: string, typedWord: string): string => {
    return wordIsCorrect(word, typedWord) ? "typing-input" : "typing-input incorrect-input";
}

export const getWordDataList = (selectedWords: string[]): WordData[] => {
    const data: WordData[] = selectedWords.map((word: string, index: number) => {
        return {
            id: index,
            word: word,
            wordCharArray: word.split(''),
            typedCharArray: [],
            incorrectAttempts: [],
            cssClass: ""
        }
    });
    data[0] = { ...data[0], cssClass: "highlighted" };
    return data;
}
