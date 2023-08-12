import React, { useEffect, useState, Suspense, ReactHTML, useReducer, useMemo } from 'react';
import { TypingExercise } from '../services/exercises/typing-exercise.abstract.service';
import { ObjectValues, TypingMode } from '../models/models';
import { FixedWordExerciseLength, FixedWordsExercise } from '../services/exercises/fixed-words-exercise.service';
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

// TODO: incorporate typedWords to use this interface. or combine both TypedWords and WordsComponents into one interface
interface TypedWordData {
    typedWord: string;
    correct: boolean;
    incorrectAttempts: []; // use to show mistakes in summary screen 
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
    wordComponents: WordComponentData[];
    typedWords: string[];
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

    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     */
    const [state, dispatch] = useReducer(
        reducer, 
        wordsService, 
        (wordsService: WordsService) => {
            return {
                words: wordsService.getRandomizedWords(), 
                wordComponents: getWordComponentList(wordsService.getRandomizedWords()),
                typedWords: wordsService.getRandomizedWords().map(() => ""),
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

    const resetStates = () => {
        wordsService.resetRandomizedWords(fixedLength);
        const newWords = wordsService.getRandomizedWords();
        dispatch({ 
            type: TypingActions.RESET, 
            payload: {
                words: newWords,
                typedWords: newWords.map(() => ""),
                wordComponents: getWordComponentList(newWords),
            }
        });
    }

    // useEffect(() => {
    //     resetStates(); // may not need the reducer equivalent of this since it's initialized with these values
    // }, [])

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

    /**
     * updates the css class of the typed word to reflect whether it was typed correctly or not. only called once word
     * is complete
     * TODO: combine with setNextHighlightedWord
     */
    const updateWordComponents = (correct: boolean): WordComponentData[] => {
        const newClassName = correct ? "correct" : "incorrect";
        let updatedWordComponents = [...state.wordComponents];
        updatedWordComponents[state.currentWord] = {
            ...updatedWordComponents[state.currentWord],
            cssClass: newClassName
        }
        return updatedWordComponents;
    }

    const setNextHighlightedWord = (wordComponents: WordComponentData[]) => {
        const updatedWordComponents = [...wordComponents];
        if (state.currentWord + 1 < state.wordComponents.length) {
            updatedWordComponents[state.currentWord + 1] = {
                ...updatedWordComponents[state.currentWord + 1],
                cssClass: "highlighted"
            }
        } 
        return updatedWordComponents;
    }

    // TODO: pass in currentWord and typedWords and pull out of function
    const updateTypedWords = (inputValue: string) => {
        console.log(`updating typed words with ${inputValue} at the ${state.currentWord} index`);
        const updatedTypedWords = [...state.typedWords];
        updatedTypedWords[state.currentWord] = inputValue;
        return updatedTypedWords;
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
                typedWords: updateTypedWords(inputValue),
                wordComponents: setNextHighlightedWord(updateWordComponents(correct)),
            }
        })

        if (state.currentWord + 1 >= state.words.length) {
            // TODO: extract into own function for finalizing type test 
            const finalTypedWords = [...state.typedWords]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            finalTypedWords[state.currentWord] = inputValue;
            const totalCharacters = getTotalCharacters(state.words);
            const correctCharacters = getCorrectCharacters(state.words, finalTypedWords);
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

    // const onInput = (event: React.ChangeEvent) => {
    //     typingService.handleInput(event);
    //     handleInput(event);
    // }

    return (
        <div className="typing-container">
            <article className="typing-display">
                {
                    state.words
                        ? state.wordComponents.map((data: WordComponentData) => {
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

const getCorrectCharacters = (words: string[], typedWords: string[]): number => {
    console.log('typed words: ', typedWords);
    let sum = 0;
    for (let i = 0; i < typedWords.length; i++) {
        if (typedWords[i] === words[i]) {
            sum += typedWords[i].length + 1;
        } else {
            console.log(`mistyped word at index ${i}. typed word: ${typedWords[i]}. correct word: ${words[i]}`);
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

export interface WordComponentData {
    id: number;
    word: string;
    cssClass: string;
}
/**
 * collects selected words into an array of span components
 * @param selectedWords the words chosen from the list for this type test
 */
const getWordComponentList = (selectedWords: string[]): WordComponentData[] => {
    const components = selectedWords.map((word: string, index: number) => {
        return {
            id: index,
            word: word,
            cssClass: ""
        }
    });
    components[0] = { ...components[0], cssClass: "highlighted" };
    return components;
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