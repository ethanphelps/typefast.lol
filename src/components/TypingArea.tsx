import React, { useEffect, useState, Suspense, ReactHTML } from 'react';
import { getWordList, getRandomizedWordsList } from '../services/words/words-service';

const LENGTH = 25;

interface TypingAreaProps {
    // words: string[];
    // setRandomizedWords: React.Dispatch<React.SetStateAction<string[]>>;
    setWpm: React.Dispatch<React.SetStateAction<number>>;
    // setStartTime: React.Dispatch<React.SetStateAction<number>>;
    // setEndTime: React.Dispatch<React.SetStateAction<number>>;
    // setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>;
    // setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>;
}

const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}

export const TypingArea = ({ 
    // words, 
    // setRandomizedWords, 
    setWpm
    // setStartTime, 
    // setEndTime, 
    // setCorrectCharacters, 
    // setIncorrectCharacters
}: TypingAreaProps): React.ReactElement => {
    const [words, setWords] = useState<string[] | null>(null);
    const [wordComponents, setWordComponents] = useState<WordComponentData[] | null>(null);
    const [currentWord, setCurrentWord] = useState(0);
    const [typedWord, setTypedWord] = useState("");
    const [inputClass, setInputClass] = useState<string>("typing-input");
    const [typingStarted, setTypingStarted] = useState<boolean>(false);
    const [correctCharacters, setCorrectCharacters] = useState<number>(0);
    const [incorrectCharacters, setIncorrectCharacters] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const resetStates = () => {
        setCurrentWord(0);
        setTypedWord("");
        const newRandomizedWords = getRandomizedWordsList(getWordList(), LENGTH);
        setWords(newRandomizedWords);
        setWordComponents(getWordComponentList(newRandomizedWords));
        setInputClass("typing-input");
        setTypingStarted(false);
        setCorrectCharacters(0);
        setIncorrectCharacters(0);
        setStartTime(null);
        setEndTime(null);
    }

    useEffect(() => {
        resetStates();
    }, []);

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
                        // TODO: move this logic to a separate function
                        onChange={(event: React.ChangeEvent) => {
                            if(!typingStarted) {
                                setStartTime(Date.now());
                                setTypingStarted(true);
                                console.log(Date.now());
                            }
                            const inputValue = (event.target as HTMLInputElement).value;
                            const keyPressed = inputValue[inputValue.length - 1];
                            if(currentWord < words.length) {
                                const newInputClass = wordIsCorrect(words[currentWord], inputValue) ? "typing-input" : "typing-input incorrect-input";
                                setInputClass(newInputClass);

                                let characterChange = 0;
                                if(keyPressed !== " ") {
                                    characterChange = inputValue.length < typedWord.length ? -1 : 1;
                                }
                                if(wordIsCorrect(words[currentWord], inputValue)) {
                                    setCorrectCharacters(correctCharacters + characterChange);
                                    console.log('correct characters typed: ', correctCharacters);
                                } else {
                                    setIncorrectCharacters(incorrectCharacters + characterChange)
                                    console.log('incorrect characters typed: ', incorrectCharacters);
                                }

                                setTypedWord(inputValue);

                                // check if word correct incrementally
                                if(shouldMoveToNextWord(inputValue, keyPressed)) {
                                    console.log('next word! word typed was: ', typedWord);
                                    if(inputValue.trim() === words[currentWord]) {
                                        console.log('word was typed correctly!');
                                    } else {
                                        console.log(`word was typed incorrectly! word should have been: ${words[currentWord]}. word typed: ${typedWord}`);
                                    }
                                    const newClassName = inputValue.trim() === words[currentWord] ? "correct" : "incorrect";
                                    // reset typedword state
                                    let newWordComponents = [...wordComponents].map((wordComponent, index) => {
                                        if(index === currentWord) {
                                            return {...wordComponent, cssClass: newClassName};
                                        }
                                        return wordComponent;
                                    });
                                    newWordComponents[currentWord] = {
                                        ...newWordComponents[currentWord],
                                        cssClass: newClassName
                                    }
                                    if(currentWord < wordComponents.length - 1) {
                                        newWordComponents = [...newWordComponents].map((wordComponent, index) => {
                                            if(index === currentWord + 1) {
                                                return {...wordComponent, cssClass: "highlighted"};
                                            }
                                            return wordComponent;
                                        })
                                        setCurrentWord(currentWord + 1);
                                    } else {
                                    //     setStartTime(null);
                                        console.log(`number of words: ${words.length}. current word: ${currentWord + 1}`);
                                        console.log('Total characters: ', getTotalCharacters(words))
                                        setEndTime(Date.now());
                                        setWpm(calculateWpm(startTime, endTime, correctCharacters, incorrectCharacters));
                                        setCurrentWord(currentWord + 1);
                                    }
                                    setTypedWord("");
                                    setWordComponents(newWordComponents);
                                    setInputClass("typing-input")
                                }
                            }
                        }}
                    >
                    </input>
                    <button type="button" className="retry-button" onClick={resetStates}>retry</button>
                </div>
            </div>
    );
}

const getTotalCharacters = (words: string[]): number => {
    return words.reduce((sum: number, word: string) => sum + word.length, 0);
}

/**
 * returns incremental correctness of the word as user is typing
 */
const wordIsCorrect = (targetWord: string, typedWord: string) => {
    if(typedWord.length < targetWord.length) {
        for(let i = 0; i < typedWord.length; i++) {
            if(typedWord[i] !== targetWord[i]) {
                return false;
            }
        }
        return true;
    }
    return typedWord.trim() === targetWord;
}


const WordComponent = ({word, cssClass}: {word: string, cssClass: string}): React.ReactElement => {
    return (
        <>
            <span className={cssClass}>{word}</span>
            <span> </span>
        </>
    );
}

interface WordComponentData {
    id: number;
    word: string;
    cssClass: string;
}
/**
 * collects selected words into an array of span components
 * @param selectedWords the words chosen from the list for this type test
 */
const getWordComponentList = (selectedWords: string[]): WordComponentData[]  => {
    // const components = selectedWords.map((word: string, index: number) => (
    //     <WordComponent word={word} cssClass="" key={index}/>
    // ));
    // components[0] = (<WordComponent word={components[0].props.word} cssClass="highlighted" key={0}/>);
    const components = selectedWords.map((word: string, index: number) => {
        return { 
            id: index, 
            word: word,
            cssClass: ""
        }
    });
    components[0] = { ...components[0], cssClass: "highlighted"};
    return components;
}

interface WordsJson {
    [key: string]: string[]
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
    const seconds = (Date.now() - startTime) / 1000;
    console.log('seconds: ', seconds);
    const wpm = (1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters) / 5);
    const wpm2 = ((1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters))) / 5;
    console.log('wpm: ', wpm);
    console.log('wpm2: ', wpm2);
    console.log(`Correct characters: ${correctCharacters}. Incorrect characters: ${incorrectCharacters}.`);
    return endTime - startTime;
}