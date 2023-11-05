// should all this state be in one interface? would this trigger unnecessary re-renders?

import { ObjectValues, TypingMode, TypingModes } from "../models/models";
import { ModeState } from "./mode-reducer";
import * as Logger from "../utils/logger";
import { ROW_SPAN, getWordDataList } from "../components/TypingArea";
import * as WordsService from '../services/words/words-service';

const INCREMENTAL_WORD_GENERATION_COUNT = 50;

export interface WordData {
    id: number;
    word: string;
    wordCharArray: string[];
    typedCharArray: string[];
    attempts: string[][];
    cssClass: string;
    mistyped: boolean;
    startTime: number | null;
    endTime: number | null;
    wpm: number | null;
}

export const TypingActions = {
    RESET: 'reset',
    QUOTE_SET: 'quote-set',
    TYPING_STARTED: 'typing-started',
    WORD_STARTED: 'word-started',
    WORD_COMPLETE: 'word-complete',
    PREVIOUS_WORD: 'previous-word',
    CHARACTER_TYPED: 'character-typed',
    CHARACTER_DELETED: 'character-deleted',
    EXERCISE_COMPLETE: 'exercise-complete',
    LAYOUT_SHIFT: 'layout-shift',
    LAYOUT_SHIFT_COMPLETED: 'layout-shift-completed',
    GET_MORE_WORDS: 'get-more-words'
} as const;
type TypingAction = ObjectValues<typeof TypingActions>;
// this may cause issues polluting state with non state fields in the reducer
interface ActionPayload {
    characterTyped: string;
    inputValue: string;
    mode: TypingMode;
    modeState: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, ExerciseDispatchInput>>>;
}
export interface ExerciseDispatchInput {
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
    partialReattemptStartTime: number | null;
    canType: boolean;
    wpm: number;
    accuracy: number;
    timeoutId?: NodeJS.Timeout;
    quoteCitation: string;
    recalculateRows: boolean;
    finalWords: string[];
    finalWordData: WordData[];
}

/**
 * new words should be passed into the reducer via payload sice typedWords and wordComponents are derived from words
 * TODO: reduce reliance on payload and set states inside reducer when possible
 */
export const exerciseReducer = (state: ExerciseState, action: ExerciseDispatchInput): ExerciseState => {
    switch (action.type) {
        case (TypingActions.RESET):
            Logger.debug(`Clearing timeout ID ${state.timeoutId}`);
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
                canType: true,
                recalculateRows: true,
                finalWords: [],
                finalWordData: []
            }

        case (TypingActions.QUOTE_SET):
            return {
                ...state,
                quoteCitation: action.payload.quoteCitation
            }

        case (TypingActions.TYPING_STARTED):
            Logger.debug('Initial states:', state);
            return {
                ...state,
                status: ExerciseStatus.IN_PROGRESS,
                typingStarted: true,
                startTime: Date.now(),
                timeoutId: setTimedModeTimer(action.payload.modeState, action.payload.dispatch),
            }

        case (TypingActions.WORD_STARTED): {
            Logger.debug('Word Started!');
            const newWordData = [...state.wordData];
            newWordData[state.currentWord].startTime = Date.now();
            return {
                ...state,
                wordData: newWordData
            }
        }

        // TODO: handle multiple characters being inserted at once into the input element (maybe? copy/paste shouldn't be expected functionality)
        case (TypingActions.CHARACTER_TYPED): {
            const inputValue = action.payload.inputValue;
            const characterTyped = inputValue[inputValue.length - 1]; // this may need to change
            let newWordData;
            let targetWord = state.wordData[state.currentWord].wordCharArray;
            let typedWord = state.wordData[state.currentWord].typedCharArray;
            if (characterTyped !== " ") {
                newWordData = [...state.wordData];
                newWordData[state.currentWord].typedCharArray.push(characterTyped);
                if (!wordIncrementallyCorrect(targetWord, typedWord)) {
                    newWordData[state.currentWord].mistyped = true;
                }
            }
            return {
                ...state,
                ...action.payload,
                wordData: newWordData ? newWordData : state.wordData,
            }
        }

        case (TypingActions.CHARACTER_DELETED): {
            const newWordData = [...state.wordData];
            let newSecondAttemptStartTime = state.partialReattemptStartTime;
            const numCharsDeleted = getDeletedCharacters(action.payload.inputValue, state.wordData[state.currentWord].typedCharArray);
            const deletedChars = typedWord(state).slice(-numCharsDeleted);
            Logger.debug('deleted chars: ', `"${deletedChars}"`);
            const length = state.wordData[state.currentWord].typedCharArray.length;
            newWordData[state.currentWord].typedCharArray = state.wordData[state.currentWord].typedCharArray.slice(0, length - numCharsDeleted);
            if (newWordData[state.currentWord].typedCharArray.length === 0) {
                Logger.debug('wpm times reset!');
                newWordData[state.currentWord].startTime = null;
                newWordData[state.currentWord].endTime = null;
                newSecondAttemptStartTime = null;
            }
            return {
                ...state,
                ...action.payload,
                wordData: newWordData,
                partialReattemptStartTime: newSecondAttemptStartTime,
            }
        }

        case (TypingActions.WORD_COMPLETE): {
            const correct = action.payload.inputValue === state.words[state.currentWord];
            const newWordData = [...state.wordData];
            const newClassName = correct ? "correct" : "incorrect";

            /**
             * if space pressed early, untyped characters filled with spaces (for highlighting).
             * TODO: remove
             */
            let updatedTypedCharArray = fillWithSpaces(state);

            newWordData[state.currentWord] = {
                ...newWordData[state.currentWord],
                typedCharArray: updatedTypedCharArray,
                cssClass: newClassName,
                mistyped: correct ? newWordData[state.currentWord].mistyped : true,
                endTime: isPartialReattempt(state.wordData[state.currentWord]) ? getPartialReattemptEndTime(state) : Date.now(),
                attempts: getNewAttempts(state)
            }

            return {
                ...state,
                ...action.payload,
                wordData: newWordData,
                currentWord: state.currentWord + 1,
            };
        }

        case (TypingActions.PREVIOUS_WORD): {
            if (state.currentWord >= 1) {
                const newWordData = [...state.wordData];
                Logger.debug(`reducer - previous word is "${newWordData[state.currentWord - 1].typedCharArray}"`);
                newWordData[state.currentWord - 1].typedCharArray.push(' ');
                return {
                    ...state,
                    wordData: newWordData,
                    currentWord: state.currentWord - 1,
                    partialReattemptStartTime: Date.now()
                }
            }
        }

        case (TypingActions.EXERCISE_COMPLETE): {
            Logger.debug('final states: ', state);
            let finalWordData: WordData[] = getFinalWordData(state, action.payload.mode || TypingModes.FIXED);
            finalWordData = calculatePerWordWpm(finalWordData);
            Logger.debug('final Word data: ', finalWordData);
            const totalCharacters = getTotalCharacters(finalWordData.map((wordData) => wordData.word));
            const correctCharacters = getCorrectCharacters(finalWordData);
            Logger.log('Total characters: ', totalCharacters)
            const wpm = calculateWpm(state.startTime, Date.now(), correctCharacters, state.incorrectCharacters);
            const accuracy = calculateNaiveAccuracy(totalCharacters, correctCharacters);
            return {
                ...state,
                ...action.payload,
                status: ExerciseStatus.COMPLETE,
                finalWordData: finalWordData,
                finalWords: state.words.slice(0, finalWordData.length),
                wpm: wpm,
                accuracy: accuracy,
                endTime: Date.now(),
                canType: false
            }
        }

        case (TypingActions.LAYOUT_SHIFT): {
            return {
                ...state,
                recalculateRows: true
            }
        }

        case (TypingActions.LAYOUT_SHIFT_COMPLETED): {
            Logger.debug('LAYOUT_SHIFT_COMPLETED');
            Logger.debug(state);
            return {
                ...state,
                recalculateRows: false
            }
        }

        case (TypingActions.GET_MORE_WORDS): {
            Logger.debug("GETTING MORE WORDS");
            const additionalWords = WordsService.getRandomWords(action.payload.modeState.wordsSource, INCREMENTAL_WORD_GENERATION_COUNT);
            Logger.debug("Additional words: ", additionalWords);
            return {
                ...state,
                words: [ ...state.words, ...additionalWords ],
                wordData: [ ...state.wordData, ...getWordDataList(additionalWords, state.words.length)]
            }
        }

        default:
            return state;
    }
}


export const computeWordRenderMap = (rowStartIndices: number[], rowOffset: number, words: string[]): Record<number, string> => {
    let wordRenderMapWithHiddenWords: Record<number, string> = {}
    for (let i = 0; i < words.length; i++) {
        if (
            (i >= rowStartIndices[rowOffset] && rowStartIndices.length <= rowOffset + ROW_SPAN) ||
            (i >= rowStartIndices[rowOffset] && i < rowStartIndices[rowOffset + ROW_SPAN])
            || rowStartIndices.length < ROW_SPAN + 1
        ) {
            wordRenderMapWithHiddenWords[i] = "";
        } else {
            wordRenderMapWithHiddenWords[i] = "hidden";
        }
    }
    return wordRenderMapWithHiddenWords;
}


export const computeRowStartIndices = (typingDisplay: React.MutableRefObject<HTMLElement>, state: ExerciseState): number[] => {
    if(!typingDisplay) {
        Logger.debug('TypingDisplay is NULL');
        return [];
    }
    const children = typingDisplay.current.children as HTMLCollection;
    const rowStartIndices: number[] = [0];
    if (children.length > 0) {
        let rowHeight = children[0].getBoundingClientRect().top;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.getBoundingClientRect().top !== rowHeight) {
                rowStartIndices.push(i);
                rowHeight = child.getBoundingClientRect().top;
            }
        }
    }
    Logger.log('Row start indices: ', rowStartIndices);
    const firstWordsOnEachRow = rowStartIndices.map(i => state.words[i]);
    Logger.log('First words on each row: ', firstWordsOnEachRow);
    return rowStartIndices;
}


const getNewAttempts = (state: ExerciseState): string[][] => {
    let newAttempts = [...state.wordData[state.currentWord].attempts];
    newAttempts.push(state.wordData[state.currentWord].typedCharArray);
    return newAttempts;
}


/**
 * Returns the new value that endTime should be set to for a given word based on the previous endTime and the amount of time spent
 * on this reattempt. The "end time" part of the name isn't quite accurate because by using this function to modify endTime for a
 * given word, we're changing its endTime to help calculate total time typing rather than indicate actual end time. actual end time 
 * would be farther in the future
 * 
 * TODO: see if we should just store duration instead of manipulating endTime to get the right duration after the exercise
 */
const getPartialReattemptEndTime = (state: ExerciseState): number => {
    const reattemptTime = Date.now() - state.partialReattemptStartTime;
    Logger.debug(`Reattempt time was: ${reattemptTime}`);
    return state.wordData[state.currentWord].endTime + reattemptTime;
}


/**
 * returns whether or not this is a user's second attempt at typing a word, meaning they've backspaced to previous and are re-typing 
 * part of the word
 */
const isPartialReattempt = (word: WordData): boolean => {
    return word.endTime !== null;
}


export type MissedWords = Record<string, number>
export const getMistypedWords = (wordData: WordData[]): MissedWords => {
    const mistyped: MissedWords = {};
    wordData.forEach((word: WordData) => {
        if (word.mistyped) {
            mistyped[word.word] = word.word in mistyped ? mistyped[word.word] + 1 : 1;
        }
    })
    return mistyped;
}


// TODO: also append final word attempt to attempts if not getting added properly
export const getFinalWordData = (state: ExerciseState, mode: TypingMode): WordData[] => {
    let finalWordData = [...state.wordData];
    if (mode === TypingModes.TIMED) {
        finalWordData[state.currentWord].endTime = Date.now();
        return wordTypedCorrectly(finalWordData[state.currentWord].wordCharArray, finalWordData[state.currentWord].typedCharArray) 
            ? finalWordData.slice(0, state.currentWord + 1) 
            : finalWordData.slice(0, state.currentWord)
    }
    finalWordData[finalWordData.length - 1].endTime = Date.now(); // prevent wpm of last word from being Infinity
    return finalWordData;
}

const setTimedModeTimer = (
    modeState: ModeState,
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, ExerciseDispatchInput>>>
): NodeJS.Timeout | null => {
    if (modeState.mode === TypingModes.TIMED) {
        Logger.debug(`Mode is ${modeState.mode} and timer is being set for ${modeState.duration} seconds!`);
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
    // Logger.log(`typedWordvalue: "${typedCharArray.join('')}", inputValue: "${inputValue}"`);
    return inputValue.length < typedCharArray.length ? typedCharArray.length - inputValue.length : 0;
}

const wordTypedCorrectly = (word: string[], typedWord: string[]): boolean => {
    if (word.length !== typedWord.length) {
        return false;
    }
    for (let i = 0; i < word.length; i++) {
        if (word[i] !== typedWord[i]) {
            return false;
        }
    }
    return true;
}

const getTotalCharacters = (words: string[]): number => {
    return words.reduce((sum: number, word: string) => sum + word.length + 1, 0);
}

const getCorrectCharacters = (wordData: WordData[]): number => {
    Logger.log('typed words: ', wordData);
    let sum = 0;
    for (let i = 0; i < wordData.length; i++) {
        if (wordTypedCorrectly(wordData[i].wordCharArray, wordData[i].typedCharArray)) {
            sum += wordData[i].typedCharArray.length + 1;
        } else {
            Logger.log(`mistyped word at index ${i}. typed word: ${wordData[i]}. correct word: ${wordData[i].word}`);
        }
    }
    Logger.log('correct characters: ', sum);
    return sum;
}

/**
 * returns incremental correctness of the word as user is typing
 */
const wordIncrementallyCorrect = (targetWord: string[], typedWord: string[]) => {
    if (typedWord.length > targetWord.length) {
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
    Logger.log(`start time: ${startTime}, end time: ${endTime}`);
    const seconds = (endTime - startTime) / 1000;
    const fractionOfMinute = seconds / 60;
    const wordsTyped = correctCharacters / 5;
    const wpm = wordsTyped / fractionOfMinute;
    Logger.log('seconds: ', seconds);
    Logger.log('wpm: ', wpm);
    return wpm;
}

const calculateNaiveAccuracy = (totalCharacters: number, correctCharacters: number) => {
    const accuracy = (correctCharacters / totalCharacters) * 100;
    Logger.log(`accuracy: ${accuracy}`);
    return accuracy;
}

const fillWithSpaces = (state: ExerciseState): string[] => {
    let updatedTypedCharArray = [...state.wordData[state.currentWord].typedCharArray];
    if (typedWord(state).length < state.wordData[state.currentWord].word.length) {
        let spaces = state.wordData[state.currentWord].wordCharArray
            .slice(typedWord(state).length - state.wordData[state.currentWord].word.length)
            .map((char: string) => ' ');
        return [...updatedTypedCharArray, ...spaces];
    }
    return [...updatedTypedCharArray];
}

const getCorrectCharactersInWord = (word: string[], typedWord: string[]): number => {
    let correct = 0;
    for (let i = 0; i < typedWord.length; i++) {
        if (i >= word.length) {
            break;
        }
        if (typedWord[i] === word[i]) {
            correct++;
        }
    }
    return correct;
}

const calculatePerWordWpm = (words: WordData[]): WordData[] => {
    return words.map((word: WordData): WordData => {
        let wpm = null;
        if (word.startTime && word.endTime) {
            const time = word.endTime - word.startTime;
            if (time < 0) {
                Logger.error("Per-Word wpm calculation error: negative time!");
            }
            const correctCharacters = getCorrectCharactersInWord(word.wordCharArray, word.typedCharArray);
            const seconds = time / 1000;
            const fractionOfMinute = seconds / 60;
            const wordsTyped = correctCharacters / 5;
            wpm = wordsTyped / fractionOfMinute;
            Logger.debug(`wpm for ${word.word}: ${wpm}`);
        } else {
            Logger.error(`Cannot calculate WPM for ${word.word}. Start time: ${word.startTime}, end time: ${word.endTime}`);
        }
        return {
            ...word,
            wpm: wpm
        }
    })
}

export const setAllWordsToRender = (words: string[]): Record<number, string> => {
    const renderMap: Record<number, string> = {};
    words.forEach((word: string, index: number) => {
        renderMap[index] = "";
    })
    return renderMap;
}