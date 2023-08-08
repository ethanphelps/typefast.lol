import React, { useEffect, useState, Suspense, ReactHTML, useReducer } from 'react';
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

const TypingActions = {
    RESET: 'reset',
    WORD_COMPLETE: 'word-complete',
    CHARACTER_TYPED: 'character-typed',
    CHARACTER_DELETED: 'character-deleted',
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

const reducer = (state: ExerciseState, action: DispatchInput): ExerciseState => {
    switch(action.type) {
        case(TypingActions.RESET):
            // const newWords = 
            return {
                ...state,
                // words: [],
                // typedWords: [],
                // wordComponents: [],
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
        case(TypingActions.CHARACTER_TYPED):
            return {
                ...state
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
    const [wordsService, setWordsService] = useState<WordsService | null>(() => new WordsService(source)); // TODO: abstract WordsService out of TypingArea component

    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     */
    const [state, dispatch] = useReducer(
        reducer, 
        wordsService.getRandomizedWords(fixedLength), 
        (initialWords: string[]) => {
            return {
                words: initialWords, // see if you can initialize this to a list of words
                wordComponents: getWordComponentList(initialWords),
                typedWords: initialWords.map(() => ""),
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
        const newWords = wordsService.getRandomizedWords(fixedLength);
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

    const handleDeletion = (inputValue: string) => {
        console.log('DELETE');
        if (state.typedWord.length === 0) {
            return;
        }
        setTypedWord(inputValue);
        // decrement correct/incorrect characters based on how much was deleted and which characters were deleted
        // need a way of telling which characters in typed word are correct/incorrect and where their location in the word is
    }

    /**
     * updates the css class of the typed word to reflect whether it was typed correctly or not
     */
    const updateWordComponents = (correct: boolean): WordComponentData[] => {
        const newClassName = correct ? "correct" : "incorrect";
        let updatedWordComponents = [...wordComponents];
        updatedWordComponents[currentWord] = {
            ...updatedWordComponents[currentWord],
            cssClass: newClassName
        }
        return updatedWordComponents;
    }

    const setNextHighlightedWord = (wordComponents: WordComponentData[]) => {
        const updatedWordComponents = [...wordComponents];
        updatedWordComponents[currentWord + 1] = {
            ...updatedWordComponents[currentWord + 1],
            cssClass: "highlighted"
        }
        return updatedWordComponents;
    }

    const updateTypedWords = (inputValue: string) => {
        console.log(`updating typed words with ${inputValue} at the ${currentWord} index`);
        const updatedTypedWords = [...typedWords];
        updatedTypedWords[currentWord] = inputValue;
        setTypedWords(updatedTypedWords);
    }

    const handleWordComplete = (inputValue: string) => {
        console.log('next word! word typed was: ', inputValue);
        updateTypedWords(inputValue)
        const correct = inputValue === words[currentWord];
        if (correct) {
            console.log('word was typed correctly!');
        } else {
            console.log(`word was typed incorrectly! word should have been: ${words[currentWord]}. word typed: ${typedWord}`);
        }
        let updatedWordComponents = updateWordComponents(correct);
        if (currentWord + 1 < wordComponents.length) {
            updatedWordComponents = setNextHighlightedWord(updatedWordComponents);
            setCurrentWord(currentWord + 1);
        } else {
            // extract into own function for finalizing type test and calculating wpm
            const finalTypedWords = [...typedWords]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            finalTypedWords[currentWord] = inputValue;
            const totalCharacters = getTotalCharacters(words);
            const correctCharacters = getCorrectCharacters(words, finalTypedWords);
            console.log(`number of words: ${words.length}. current word: ${currentWord + 1}`);
            console.log('Total characters: ', totalCharacters)
            setEndTime(Date.now());
            setWpm(calculateWpm(startTime, Date.now(), correctCharacters, incorrectCharacters));
            setAccuracy(calculateNaiveAccuracy(totalCharacters, correctCharacters));
            setCurrentWord(currentWord + 1);
        }
        setTypedWord("");
        setWordComponents(updatedWordComponents);
        setInputClass("typing-input")

    }

    const handleInput = (event: React.ChangeEvent) => {
        if (currentWord >= words.length) {
            return;
        }
        if (!typingStarted) {
            setStartTime(Date.now());
            setTypingStarted(true);
            console.log(Date.now());
        }
        const inputValue = (event.target as HTMLInputElement).value;
        console.log((event.nativeEvent as InputEvent).inputType);
        if (isDelete(event, inputValue)) {
            handleDeletion(inputValue);
            return; // should we return here?
        }
        const characterTyped = isDelete(event, inputValue) ? null : inputValue[inputValue.length - 1];

        const newInputClass = wordIsCorrect(words[currentWord], inputValue) ? "typing-input" : "typing-input incorrect-input";
        setInputClass(newInputClass);

        let characterChange = 0;
        if (characterTyped !== " ") {
            characterChange = inputValue.length < typedWord.length ? -1 : 1;
        }
        // this logic is flawed bc it doesn't account for how many characters were deleted in one motion and how many were correct/incorrect
        if (wordIsCorrect(words[currentWord], inputValue)) {
            setCorrectCharacters(correctCharacters + characterChange);
            console.log('correct characters typed: ', correctCharacters);
        } else {
            setIncorrectCharacters(incorrectCharacters + characterChange)
            console.log('incorrect characters typed: ', incorrectCharacters);
        }

        setTypedWord(inputValue);

        // check if word correct incrementally
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
                    words
                        ? wordComponents.map((data: WordComponentData) => {
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
                    value={typedWord}
                    className={inputClass}
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
    const wpm3 = wordsTyped / fractionOfMinute;
    console.log('seconds: ', seconds);
    const wpm = (1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters) / 5);
    const wpm2 = ((1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters))) / 5;
    console.log('wpm: ', wpm);
    console.log('wpm2: ', wpm2);
    console.log('wpm3: ', wpm3);
    console.log(`Correct characters: ${correctCharacters}. Incorrect characters: ${incorrectCharacters}.`);
    return wpm3;
}

const calculateNaiveAccuracy = (totalCharacters: number, correctCharacters: number) => {
    return (correctCharacters / totalCharacters) * 100;
}