import React, { useEffect, useState, Suspense, ReactHTML } from 'react';
import { getWordList, getRandomizedWordsList } from '../services/words/words-service';
import { TypingService } from '../services/typing/typing-service';

const LENGTH = 25;
const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];

interface TypingAreaProps {
    setWpm: React.Dispatch<React.SetStateAction<number>>;
}

const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}


export const TypingArea = ({ 
    setWpm
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
    let typingService: TypingService;
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

    const isDelete = (event: React.ChangeEvent, inputValue: string): boolean => {
        return deleteInputTypes.includes((event.nativeEvent as InputEvent).inputType) || inputValue.length < typedWord.length;
    }

    const handleDeletion = (inputValue: string) => {
        console.log('DELETE');
        if(typedWord.length === 0) {
            return;
        }
        setTypedWord(inputValue);
        // decrement correct/incorrect characters based on how much was deleted and which characters were deleted
        // need a way of telling which characters in typed word are correct/incorrect and where their location in the word is
    }

    const handleInput = (event: React.ChangeEvent) => {
        if(currentWord >= words.length) {
            return;
        }
        if(!typingStarted) {
            setStartTime(Date.now());
            setTypingStarted(true);
            console.log(Date.now());
        }
        const inputValue = (event.target as HTMLInputElement).value;
        console.log((event.nativeEvent as InputEvent).inputType);
        if(isDelete(event, inputValue)) {
            handleDeletion(inputValue);
            return; // should we return here?
        }
        const characterTyped = isDelete(event, inputValue) ? null : inputValue[inputValue.length - 1]; 

        const newInputClass = wordIsCorrect(words[currentWord], inputValue) ? "typing-input" : "typing-input incorrect-input";
        setInputClass(newInputClass);

        let characterChange = 0;
        if(characterTyped !== " ") {
            characterChange = inputValue.length < typedWord.length ? -1 : 1;
        }
        // this logic is flawed bc it doesn't account for how many characters were deleted in one motion and how many were correct/incorrect
        if(wordIsCorrect(words[currentWord], inputValue)) {
            setCorrectCharacters(correctCharacters + characterChange);
            console.log('correct characters typed: ', correctCharacters);
        } else {
            setIncorrectCharacters(incorrectCharacters + characterChange)
            console.log('incorrect characters typed: ', incorrectCharacters);
        }

        setTypedWord(inputValue);

        // check if word correct incrementally
        if(shouldMoveToNextWord(inputValue, characterTyped)) {
            console.log('next word! word typed was: ', typedWord);
            if(inputValue.trim() === words[currentWord]) {
                console.log('word was typed correctly!');
            } else {
                console.log(`word was typed incorrectly! word should have been: ${words[currentWord]}. word typed: ${typedWord}`);
            }
            const newClassName = inputValue.trim() === words[currentWord] ? "correct" : "incorrect"; // setting css class for completed word
            // reset typedword state
            // does this map need to be here? can't you just index into the wordComponents array? the deep copy may be for triggering rerender actually...
            // extract into own function
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
            // extract into own function for setting next highlighted word
            if(currentWord + 1 < wordComponents.length) {
                newWordComponents = [...newWordComponents].map((wordComponent, index) => {
                    if(index === currentWord + 1) {
                        return {...wordComponent, cssClass: "highlighted"};
                    }
                    return wordComponent;
                })
                setCurrentWord(currentWord + 1);
            } else {
            //     setStartTime(null);
                // extract into own function for finalizing type test and calculating wpm
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

export interface WordComponentData {
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