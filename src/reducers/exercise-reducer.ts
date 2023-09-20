// should all this state be in one interface? would this trigger unnecessary re-renders?

import { ObjectValues, TypingMode, TypingModes } from "../models/models";
import WordsService from "../services/words/words-service";
import { ModeState } from "./mode-reducer";

// TODO: remove 'word' from state and rely on wordCharArray instead
export interface WordData {
    id: number;
    word: string; 
    wordCharArray: string[];
    typedCharArray: string[]; // char array version of word to use for char highlighting
    incorrectAttempts: []; 
    cssClass: string;
    mistyped: boolean;
}

export const TypingActions = {
    RESET: 'reset',
    TYPING_STARTED: 'typing-started',
    WORD_COMPLETE: 'word-complete',
    PREVIOUS_WORD: 'previous-word',
    CHARACTER_TYPED: 'character-typed',
    CHARACTER_DELETED: 'character-deleted', // may be superfluous 
    EXERCISE_COMPLETE: 'exercise-complete'
} as const;
type TypingAction = ObjectValues<typeof TypingActions>;
// this may cause issues polluting state with non state fields in the reducer
interface ActionPayload {
    characterTyped: string;
    inputValue: string;
    mode: TypingMode;
    modeState: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, DispatchInput>>>;
}
export interface DispatchInput {
    type: TypingAction;
    payload?: Partial<ExerciseState> & Partial<ActionPayload>;
}

export const ExerciseStatus = {
    READY: "READY",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETE: "COMPLETE"
} as const;
export type ExerciseStatusValue = ObjectValues<typeof ExerciseStatus>;

export interface ExerciseState {
    status: ExerciseStatusValue;
    words: string[];
    wordData: WordData[];
    currentWord: number;
    cursor: number;
    typingStarted: boolean;
    correctCharacters: number;
    incorrectCharacters: number;
    startTime: number | null;
    endTime: number | null;
    canType: boolean;
    wpm: number;
    accuracy: number;
    timeoutId?: NodeJS.Timeout;
}

/**
 * new words should be passed into the reducer via payload sice typedWords and wordComponents are derived from words
 * TODO: reduce reliance on payload and set states inside reducer when possible
 */
export const exerciseReducer = (state: ExerciseState, action: DispatchInput): ExerciseState => {
    switch(action.type) {
        case(TypingActions.RESET):
            console.debug(`Clearing timeout ID ${state.timeoutId}`);
            clearTimeout(state.timeoutId);
            return {
                ...state,
                ...action.payload,
                // status: ExerciseStatus.COMPLETE, // TODO: remove this
                status: ExerciseStatus.READY,
                currentWord: 0,
                cursor: 0,
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
                status: ExerciseStatus.IN_PROGRESS,
                typingStarted: true,
                startTime: Date.now(),
                timeoutId: setTimedModeTimer(action.payload.modeState, action.payload.dispatch)
            }

        // TODO: handle multiple characters being inserted at once into the input element (maybe? copy/paste shouldn't be expected functionality)
        case(TypingActions.CHARACTER_TYPED): {
            const inputValue = action.payload.inputValue;
            const characterTyped = inputValue[inputValue.length - 1]; // this may need to change
            let newWordData;
            let targetWord = state.wordData[state.currentWord].wordCharArray;
            let typedWord = state.wordData[state.currentWord].typedCharArray;
            if(characterTyped !== " ") {
                newWordData = [...state.wordData];
                newWordData[state.currentWord].typedCharArray.push(characterTyped);
                if(!wordIncrementallyCorrect(targetWord, typedWord)) {
                    newWordData[state.currentWord].mistyped = true;
                }
            }
            return {
                ...state,
                ...action.payload,
                wordData: newWordData ? newWordData : state.wordData
            }
        }

        case(TypingActions.CHARACTER_DELETED): {
            const newWordData = [...state.wordData];
            const numCharsDeleted = getDeletedCharacters(action.payload.inputValue, state.wordData[state.currentWord].typedCharArray);
            const deletedChars = typedWord(state).slice(-numCharsDeleted);
            console.debug('deleted chars: ', deletedChars);
            const length = state.wordData[state.currentWord].typedCharArray.length;
            newWordData[state.currentWord].typedCharArray = state.wordData[state.currentWord].typedCharArray.slice(0, length - numCharsDeleted);
            console.debug('new char array: ', newWordData[state.currentWord].typedCharArray);
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
                cssClass: newClassName,
                mistyped: correct ? newWordData[state.currentWord].mistyped : true
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
                // currentWord: state.currentWord >= state.words.length - 1 ? state.currentWord : state.currentWord + 1,
                currentWord: state.currentWord + 1,
            }
        
        case(TypingActions.PREVIOUS_WORD): {
            if(state.currentWord >= 1) {
                const newWordData = [...state.wordData];
                newWordData[state.currentWord - 1].typedCharArray.push(' ');
                return {
                    ...state,
                    currentWord: state.currentWord - 1
                }
            }
        }

        case(TypingActions.EXERCISE_COMPLETE): {
            console.debug(`final currentWord value: ${state.currentWord}`);
            console.debug('final states: ', state);
            const finalWordData: WordData[] = getFinalWordData(state, action.payload.mode || TypingModes.FIXED); 
            console.debug('final Word data: ', finalWordData);
            const totalCharacters = getTotalCharacters(finalWordData.map((wordData) => wordData.word));
            const correctCharacters = getCorrectCharacters(finalWordData);
            console.log(`number of words: ${state.words.length}. current word: ${state.currentWord + 1}`);
            console.log('Total characters: ', totalCharacters)
            const wpm = calculateWpm(state.startTime, Date.now(), correctCharacters, state.incorrectCharacters);
            const accuracy = calculateNaiveAccuracy(totalCharacters, correctCharacters);
            const mistypedWords = getMistypedWords(finalWordData);
            console.log('Mistyped words: ', mistypedWords);
            return {
                ...state,
                ...action.payload,
                status: ExerciseStatus.COMPLETE,
                wpm: wpm,
                accuracy: accuracy,
                endTime: Date.now(),
                canType: false
            }
        }

        default:
            return state;
    }
}

export const getMistypedWords = (wordData: WordData[]): WordData[] => {
    const mistyped: WordData[] = [];
    wordData.forEach((word: WordData) => {
        if(word.mistyped) {
            mistyped.push(word);
        }
    })
    return mistyped;
}

export const handleKeyDown  = (event: KeyboardEvent): void => {
    // TODO: remove if deemed unnecessary 
}

const getFinalWordData = (state: ExerciseState, mode: TypingMode): WordData[] => {
    if(mode === TypingModes.FIXED || mode === TypingModes.QUOTES) {
        return [...state.wordData];
    } else if (mode === TypingModes.TIMED) {
        return state.wordData.slice(0, state.currentWord); // TODO: see how to handle timer ending when last letter of last word typed correctly but no space pressed (should count as correct)
    }
    return [...state.wordData];
}

const setTimedModeTimer = (
    modeState: ModeState,
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, DispatchInput>>>
): NodeJS.Timeout | null => {
    if (modeState.mode === TypingModes.TIMED) {
        console.debug(`Mode is ${modeState.mode} and timer is being set for ${modeState.duration} seconds!`);
        return setTimeout(() => {
            dispatch({ 
                type: TypingActions.EXERCISE_COMPLETE,
                payload: {
                    mode: TypingModes.TIMED
                }
            });
        }, modeState.duration * 1000);
    }
}

export const typedWord = (state: ExerciseState): string => {
    return state.wordData[state.currentWord].typedCharArray.join('');
}

const getDeletedCharacters = (inputValue: string, typedCharArray: string[]): number => {
    return inputValue.length < typedCharArray.length ? typedCharArray.length - inputValue.length : 0;
}

const wordTypedCorrectly = (word: string[], typedWord: string[]): boolean => {
    if (word.length !== typedWord.length) {
        return false;
    }
    word.forEach((character: string, index: number) => {
        if (character !== typedWord[index]) {
            return false;
        }
    });
    return true;
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

/**
 * returns incremental correctness of the word as user is typing
 * TODO: use wordCharArray and typedCharArray instead of word and typed word
 */
const wordIncrementallyCorrect = (targetWord: string[], typedWord: string[]) => {
    if(typedWord.length > targetWord.length) {
        return false;
    }
    for (let i = 0; i < typedWord.length; i++) {
        if (typedWord[i] !== targetWord[i]) {
            return false;
        }
    }
    return true;
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