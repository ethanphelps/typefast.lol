import React, { useEffect, useState, Suspense, ReactHTML, useReducer, useMemo, useRef } from 'react';
import { ObjectValues, TypingMode, FixedWordExerciseLength, TypingModes } from '../models/models';
import { WordsSource } from '../services/words/words.interface';
import WordsService from '../services/words/words-service';
import WordComponent from './Word';
import { ModeState } from '../reducers/mode-reducer';
import { ExerciseActions, ExerciseStatsDispatchInput, ExerciseStatsState } from '../pages/landing/Landing';

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];


// should all this state be in one interface? would this trigger unnecessary re-renders?
// TODO: remove 'word' from state and rely on wordCharArray instead
interface WordData {
    id: number;
    word: string; 
    wordCharArray: string[];
    typedCharArray: string[]; // char array version of word to use for char highlighting
    incorrectAttempts: []; 
    cssClass: string;
}

const TypingActions = {
    RESET: 'reset',
    TYPING_STARTED: 'typing-started',
    WORD_COMPLETE: 'word-complete',
    WORD_DELETED: 'word-deleted',
    CHARACTER_TYPED: 'character-typed',
    CHARACTER_DELETED: 'character-deleted', // may be superfluous 
    EXERCISE_COMPLETE: 'exercise-complete'
} as const;
type TypingAction = ObjectValues<typeof TypingActions>;
// this may cause issues polluting state with non state fields in the reducer
interface ActionPayload {
    characterTyped: string;
    inputValue: string;
    exerciseStatsDispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseStatsState, ExerciseStatsDispatchInput>>>
}
interface DispatchInput {
    type: TypingAction;
    payload?: Partial<ExerciseState> & Partial<ActionPayload>;
}

interface ExerciseState {
    words: string[];
    wordData: WordData[];
    currentWord: number;
    cursor: number;
    inputClass: string;
    typingStarted: boolean;
    correctCharacters: number;
    incorrectCharacters: number;
    startTime: number | null;
    endTime: number | null;
    canType: boolean;
}

/**
 * new words should be passed into the reducer via payload sice typedWords and wordComponents are derived from words
 * TODO: reduce reliance on payload and set states inside reducer when possible
 */
export const reducer = (state: ExerciseState, action: DispatchInput): ExerciseState => {
    switch(action.type) {
        case(TypingActions.RESET):
            return {
                ...state,
                ...action.payload,
                currentWord: 0,
                cursor: 0,
                inputClass: "typing-input",
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null,
                canType: true
            }

        case(TypingActions.TYPING_STARTED):
            console.debug('Initial states:', state);
            return {
                ...state,
                typingStarted: true,
                startTime: Date.now()
            }

        case(TypingActions.CHARACTER_TYPED): {
            const inputValue = action.payload.inputValue;
            const characterTyped = inputValue[inputValue.length - 1];
            let newWordData;
            if(characterTyped !== " ") {
                newWordData = [...state.wordData];
                newWordData[state.currentWord].typedCharArray.push(characterTyped);
                console.debug('new word data: ', newWordData);
            }
            return {
                ...state,
                ...action.payload,
                wordData: newWordData ? newWordData : state.wordData
            }
        }
        // TODO: need to get this to handle ctrl-delete for deleting whole words and cmd-delete for deleting whole lines
        case(TypingActions.CHARACTER_DELETED): {
            const newWordData = [...state.wordData];
            const numCharsDeleted = getDeletedCharacters(action.payload.inputValue, state.wordData[state.currentWord].typedCharArray);
            const deletedChars = typedWord(state).slice(-numCharsDeleted);
            console.debug('deleted chars: ', deletedChars);
            const length = state.wordData[state.currentWord].typedCharArray.length;
            newWordData[state.currentWord].typedCharArray = state.wordData[state.currentWord].typedCharArray.slice(0, length - numCharsDeleted);
            console.debug('new char array: ', newWordData[state.currentWord].typedCharArray);
            // console.debug('character deleted! new word data: ', newWordData);
            return {
                ...state,
                ...action.payload,
                wordData: newWordData
            }
        }

        case(TypingActions.WORD_COMPLETE):
            const correct = action.payload.inputValue === state.words[state.currentWord];
            if (correct) {
                console.log('word was typed correctly!');
            } else {
                console.log(`word was typed incorrectly! word should have been: ${state.words[state.currentWord]}. word typed: ${typedWord(state)}`);
            }
            const newWordData = [...state.wordData];
            const newClassName = correct ? "correct" : "incorrect";
            let updatedTypedCharArray = state.wordData[state.currentWord].typedCharArray;
            if(typedWord(state).length < state.wordData[state.currentWord].word.length) {
                let spaces = state.wordData[state.currentWord].wordCharArray
                    .slice(typedWord(state).length - state.wordData[state.currentWord].word.length)
                    .map((char: string) => ' ');
                updatedTypedCharArray = [...state.wordData[state.currentWord].typedCharArray, ...spaces];
            }
            newWordData[state.currentWord] = {
                ...newWordData[state.currentWord],
                typedCharArray: updatedTypedCharArray,
                cssClass: newClassName
            }
            if (state.currentWord + 1 < state.wordData.length) {
                newWordData[state.currentWord + 1] = {
                    ...newWordData[state.currentWord + 1],
                    cssClass: "highlighted"
                }
            } 
            return {
                ...state,
                ...action.payload,
                wordData: newWordData,
                currentWord: state.currentWord >= state.words.length ? state.currentWord : state.currentWord + 1,
                inputClass: "typing-input"
            }
        
        case(TypingActions.WORD_DELETED):
            return {
                ...state,
            }

        case(TypingActions.EXERCISE_COMPLETE): {
            console.debug('final states: ', state);
            const finalWordData: WordData[] = [...state.wordData]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            console.debug('final Word data: ', [...state.wordData]);
            finalWordData[state.currentWord].typedCharArray = action.payload.inputValue.split('');
            const totalCharacters = getTotalCharacters(finalWordData.map((wordData) => wordData.word));
            const correctCharacters = getCorrectCharacters(finalWordData);
            console.log(`number of words: ${state.words.length}. current word: ${state.currentWord + 1}`);
            console.log('Total characters: ', totalCharacters)
            const wpm = calculateWpm(state.startTime, Date.now(), correctCharacters, state.incorrectCharacters);
            const accuracy = calculateNaiveAccuracy(totalCharacters, correctCharacters);
            action.payload.exerciseStatsDispatch({
                type: ExerciseActions.EXERCISE_COMPLETE,
                payload: {
                    wpm: wpm,
                    accuracy: accuracy
                }
            })

            return {
                ...state,
                ...action.payload,
                currentWord: state.currentWord + 1,
                endTime: Date.now(),
                canType: false
            }
        }

        default:
            return state;
    }
}


interface TypingAreaProps {
    setWpm: React.Dispatch<React.SetStateAction<number>>;
    setAccuracy: React.Dispatch<React.SetStateAction<number>>;
    exerciseStatsDispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseStatsState, ExerciseStatsDispatchInput>>>
    // mode: TypingMode;
    // fixedLength: FixedWordExerciseLength;
    // source: WordsSource;
    modeState: ModeState
}
// should mode state be passed together as one prop value or as individual prop values?
export const TypingArea = ({
    setWpm,
    setAccuracy,
    exerciseStatsDispatch,
    modeState
}: TypingAreaProps): React.ReactElement => {
    // useMemo callback only called on initial render and when dependencies change
    const wordsService = useMemo(() => {
        // TODO: could memoize the wordsService instance instead of memoizing the result of calling getRandomizedWords()
        return new WordsService(modeState.mode, modeState.wordsSource, modeState.wordCount);
    }, [modeState.wordCount, modeState.wordsSource, modeState.mode]);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     * Unless there's a page refresh, wordsService will always be the initial value returned by useMemo even if props changing causes
     * TypingArea to rerender... That's why state.wordsData isn't getting updated. Need to explicitly update state when wordsService changes
     * via useEffect
     */
    const [state, dispatch] = useReducer(
        reducer, 
        wordsService, 
        (wordsService: WordsService): ExerciseState => {
            return {
                words: wordsService.getRandomizedWords(), 
                wordData: getWordDataList(wordsService.getRandomizedWords()),
                currentWord: 0,
                cursor: 0,
                inputClass: "typing-input",
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null,
                canType: true
            }
        }
    )

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
            payload: { inputValue: inputValue }
        })

        if (checkEndOfExercise(state, modeState)) {
            // TODO: extract into own function for finalizing type test..
            // const finalWordData: WordData[] = [...state.wordData]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            // finalWordData[state.currentWord].typedCharArray = inputValue.split('');
            // const totalCharacters = getTotalCharacters(finalWordData.map((wordData) => wordData.word));
            // const correctCharacters = getCorrectCharacters(finalWordData);
            // console.log(`number of words: ${state.words.length}. current word: ${state.currentWord + 1}`);
            // console.log('Total characters: ', totalCharacters)
            dispatch({
                type: TypingActions.EXERCISE_COMPLETE,
                payload: {
                    inputValue: inputValue
                }
            });
            // setWpm(calculateWpm(state.startTime, Date.now(), correctCharacters, state.incorrectCharacters));
            // setAccuracy(calculateNaiveAccuracy(totalCharacters, correctCharacters));
        }

    }

    const handleInput = (event: React.ChangeEvent) => {
        if (state.currentWord >= state.words.length || !state.canType) {
            return;
        }
        if (!state.typingStarted) {
            dispatch({type: TypingActions.TYPING_STARTED}); // TODO: only trigger typing started if the character typed is a letter/number/symbol
            setTimer(modeState, dispatch);
        }
        const inputValue = (event.target as HTMLInputElement).value;

        if (isDelete(event, inputValue)) {
            console.debug('deletion: ', inputValue);
            handleDeletion(inputValue);
            return; // should we return here?
        }

        dispatch({ 
            type: TypingActions.CHARACTER_TYPED, 
            payload: { 
                inputValue: inputValue,
                inputClass: getInputClass(state.words[state.currentWord], inputValue)
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

const setTimer = (
    modeState: ModeState, 
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, DispatchInput>>>
): void => {
    if(modeState.mode === TypingModes.TIMED) {
        console.debug(`Mode is ${modeState.mode} and timer is being set for ${modeState.duration} seconds!`);
        setTimeout(() => {
            dispatch({type: TypingActions.EXERCISE_COMPLETE});
        }, modeState.duration * 1000)
    }
}

const checkEndOfExercise = (exerciseState: ExerciseState, modeState: ModeState): boolean => {
    if(modeState.mode === TypingModes.FIXED) {
        return exerciseState.currentWord + 1 >= exerciseState.words.length;
    } else if (modeState.mode === TypingModes.TIMED) {
        return false;
    }
}

const typedWord = (state: ExerciseState): string => {
    return state.wordData[state.currentWord].typedCharArray.join('');
}

const getDeletedCharacters = (inputValue: string, typedCharArray: string[]): number => {
    return inputValue.length < typedCharArray.length ? typedCharArray.length - inputValue.length : 0;
}

// TODO: add force correctness mode, but that would just affect the overall correctness, not whether you can move to the next word or not
const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}

const getTotalCharacters = (words: string[]): number => {
    return words.reduce((sum: number, word: string) => sum + word.length + 1, 0);
}

const getCorrectCharacters = (wordData: WordData[]): number => {
    console.log('typed words: ', wordData);
    let sum = 0;
    for (let i = 0; i < wordData.length; i++) {
        if (wordTypedCorrectly(wordData[i].wordCharArray, wordData[i].typedCharArray)) {
            sum += wordData[i].typedCharArray.length + 1;
        } else {
            console.log(`mistyped word at index ${i}. typed word: ${wordData[i]}. correct word: ${wordData[i].word}`);
        }
    }
    console.log('correct characters: ', sum);
    return sum;
}

const wordTypedCorrectly = (word: string[], typedWord: string[]): boolean => {
    if(word.length !== typedWord.length) {
        return false;
    }
    word.forEach((character: string, index: number) => {
        if (character !== typedWord[index]) {
            return false;
        }
    });
    return true;
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

const getWordDataList = (selectedWords: string[]): WordData[] => {
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

/**
 * WPM = characters per min / 5
 */
const calculateWpm = (startTime: number, endTime: number, correctCharacters: number, incorrectCharacters: number) => {
    console.log(`start time: ${startTime}, end time: ${endTime}`);
    const seconds = (endTime - startTime) / 1000;
    const fractionOfMinute = seconds / 60;
    const wordsTyped = correctCharacters / 5;
    const wpm = wordsTyped / fractionOfMinute;
    console.log('seconds: ', seconds);
    console.log('wpm: ', wpm);
    return wpm;
}

const calculateNaiveAccuracy = (totalCharacters: number, correctCharacters: number) => {
    const accuracy = (correctCharacters / totalCharacters) * 100;
    console.log(`accuracy: ${accuracy}`);
    return accuracy;
}