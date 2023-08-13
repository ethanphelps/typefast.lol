import React, { useEffect, useState, Suspense, ReactHTML, useReducer, useMemo, useRef } from 'react';
import { ObjectValues, TypingMode } from '../models/models';
import { FixedWordExerciseLength } from '../services/exercises/fixed-words-exercise.service';
import { WordsSource } from '../services/words/words.interface';
import WordsService from '../services/words/words-service';

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];

interface TypingAreaProps {
    setWpm: React.Dispatch<React.SetStateAction<number>>;
    setAccuracy: React.Dispatch<React.SetStateAction<number>>;
    mode: TypingMode;
    fixedLength: FixedWordExerciseLength;
    source: WordsSource;
}

// should all this state be in one interface? would this trigger unnecessary re-renders?
interface WordData {
    id: number;
    word: string;
    charArray: string[]; // char array version of word to use for char highlighting
    typedWord: string;
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
interface DispatchInput {
    type: TypingAction;
    payload?: Partial<ExerciseState>
}

interface ExerciseState {
    words: string[];
    wordData: WordData[];
    currentWord: number;
    typedWord: string;
    inputClass: string;
    typingStarted: boolean;
    correctCharacters: number;
    incorrectCharacters: number;
    startTime: number | null;
    endTime: number | null;
}

/**
 * new words should be passed into the reducer via payload sice typedWords and wordComponents are derived from words
 * TODO: reduce reliance on payload and set states inside reducer when possible
 */
const reducer = (state: ExerciseState, action: DispatchInput): ExerciseState => {
    switch(action.type) {
        case(TypingActions.RESET):
            return {
                ...state,
                ...action.payload,
                currentWord: 0,
                typedWord: "",
                inputClass: "typing-input",
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null
            }
        case(TypingActions.TYPING_STARTED):
            return {
                ...state,
                typingStarted: true,
                startTime: Date.now()
            }
        case(TypingActions.CHARACTER_TYPED):
            return {
                ...state,
                ...action.payload,
            }
        case(TypingActions.CHARACTER_DELETED):
            return {
                ...state,
                ...action.payload,
            }
        case(TypingActions.WORD_COMPLETE):
            return {
                ...state,
                ...action.payload,
                typedWord: "",
                currentWord: state.currentWord + 1,
                inputClass: "typing-input"
            }
        case(TypingActions.WORD_DELETED):
            return {
                ...state,
                ...action.payload,
            }
        case(TypingActions.EXERCISE_COMPLETE):
            console.debug('final states: ', state);
            return {
                ...state,
                ...action.payload,
                currentWord: state.currentWord + 1,
                endTime: Date.now()
            }
        default:
            return state;
    }
}

export const TypingArea = ({
    setWpm,
    setAccuracy,
    mode,
    fixedLength,
    source
}: TypingAreaProps): React.ReactElement => {
    // useMemo callback only called on initial render and when dependencies change
    const wordsService = useMemo(() => {
        // TODO: could memoize the wordsService instance instead of memoizing the result of calling getRandomizedWords()
        return new WordsService(source, fixedLength);
    }, [fixedLength, source, mode]);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     */
    const [state, dispatch] = useReducer(
        reducer, 
        wordsService, 
        (wordsService: WordsService): ExerciseState => {
            return {
                words: wordsService.getRandomizedWords(), 
                wordData: getWordDataList(wordsService.getRandomizedWords()),
                currentWord: 0,
                typedWord: "",
                inputClass: "typing-input",
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null
            }
        }
    )

    useEffect(() => {
        inputRef.current.focus();
    }, [])

    const resetStates = () => {
        wordsService.resetRandomizedWords(fixedLength);
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
        return deleteInputTypes.includes((event.nativeEvent as InputEvent).inputType) || inputValue.length < state.typedWord.length;
    }

    // TODO: change this logic to handle going backwards to other words
    const handleDeletion = (inputValue: string) => {
        console.debug('DELETE');
        if (state.typedWord.length === 0) {
            return;
        }
    }

    // TODO: move this into reducer
    const updateWordData = (inputValue: string, correct: boolean, wordData: WordData[]) => {
        const newWordData = [...wordData];
        const newClassName = correct ? "correct" : "incorrect";
        newWordData[state.currentWord] = {
            ...newWordData[state.currentWord],
            typedWord: inputValue,
            cssClass: newClassName
        }
        if (state.currentWord + 1 < wordData.length) {
            newWordData[state.currentWord + 1] = {
                ...newWordData[state.currentWord + 1],
                cssClass: "highlighted"
            }
        } 
        return newWordData;
    }

    const handleWordComplete = (inputValue: string) => {
        const correct = inputValue === state.words[state.currentWord];
        if (correct) {
            console.log('word was typed correctly!');
        } else {
            console.log(`word was typed incorrectly! word should have been: ${state.words[state.currentWord]}. word typed: ${state.typedWord}`);
        }
        dispatch({
            type: TypingActions.WORD_COMPLETE, 
            payload: {
                // typedWords: updateTypedWords(inputValue),
                // wordComponents: setNextHighlightedWord(updateWordComponents(correct)),
                wordData: updateWordData(inputValue, correct, state.wordData),
            }
        })

        if (state.currentWord + 1 >= state.words.length) {
            // TODO: extract into own function for finalizing type test 
            const finalWordData = [...state.wordData]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            finalWordData[state.currentWord].typedWord = inputValue;
            const totalCharacters = getTotalCharacters(finalWordData.map((wordData) => wordData.word));
            const correctCharacters = getCorrectCharacters(finalWordData);
            console.log(`number of words: ${state.words.length}. current word: ${state.currentWord + 1}`);
            console.log('Total characters: ', totalCharacters)
            dispatch({
                type: TypingActions.EXERCISE_COMPLETE,
            });
            setWpm(calculateWpm(state.startTime, Date.now(), correctCharacters, state.incorrectCharacters));
            setAccuracy(calculateNaiveAccuracy(totalCharacters, correctCharacters));
        }

    }

    const handleInput = (event: React.ChangeEvent) => {
        if (state.currentWord >= state.words.length) {
            return;
        }
        if (!state.typingStarted) {
            dispatch({type: TypingActions.TYPING_STARTED})
        }
        const inputValue = (event.target as HTMLInputElement).value;

        dispatch({ 
            type: TypingActions.CHARACTER_TYPED, 
            payload: { 
                typedWord: inputValue,
                inputClass: getInputClass(state.words[state.currentWord], inputValue)
            }
        });

        if (isDelete(event, inputValue)) {
            handleDeletion(inputValue);
            return; // should we return here?
        }
        const characterTyped = isDelete(event, inputValue) ? null : inputValue[inputValue.length - 1];

        if (shouldMoveToNextWord(inputValue, characterTyped)) {
            handleWordComplete(inputValue.trim());
        }
    }

    return (
        <div className="typing-container">
            <article className="typing-display">
                {
                    state.words
                        ? state.wordData.map((data: WordData) => {
                            return <WordComponent
                                word={data.word}
                                key={data.id}
                                cssClass={data.cssClass}
                            />
                        })
                        : null
                }
            </article>
            <div className="input-row">
                <input
                    type="text"
                    value={state.typedWord}
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
        if (wordData[i].typedWord === wordData[i].word) {
            sum += wordData[i].typedWord.length + 1;
        } else {
            console.log(`mistyped word at index ${i}. typed word: ${wordData[i]}. correct word: ${wordData[i].word}`);
        }
    }
    console.log('correct characters: ', sum);
    return sum;
}

/**
 * returns incremental correctness of the word as user is typing
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

const WordComponent = ({ word, cssClass }: { word: string, cssClass: string }): React.ReactElement => {
    return (
        <>
            <span className={cssClass}>{word}</span>
            <span> </span>
        </>
    );
}

const getWordDataList = (selectedWords: string[]): WordData[] => {
    const data: WordData[] = selectedWords.map((word: string, index: number) => {
        return {
            id: index,
            word: word,
            typedWord: "",
            incorrectAttempts: [],
            cssClass: ""
        }
    });
    data[0] = { ...data[0], cssClass: "highlighted" };
    return data;
}


/**
 * WPM = characters per min / 5
 * @param startTime 
 * @param endTime 
 * @param wordCount 
 * @returns 
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