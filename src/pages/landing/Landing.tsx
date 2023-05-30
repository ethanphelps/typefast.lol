import React, { useEffect, useState, Suspense, ReactHTML } from 'react';
import './landing.scss';
import Link from '../../components/Link';
import { getConfig } from '../../config';

const config = getConfig();

interface IconButtonProps {
    image: React.ReactElement;
    path?: string;
}
export const IconButton = ({
    image,
    path,
}: IconButtonProps): React.ReactElement => {
    return (
        <a className="icon-button" href={path}>
            {image}
        </a>
    );
};


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
        </header>
    );
};



interface TypingAreaProps {
    words: string[];
    setRandomizedWords: React.Dispatch<React.SetStateAction<string[]>>;
    setWpm: React.Dispatch<React.SetStateAction<number>>;
    // setStartTime: React.Dispatch<React.SetStateAction<number>>;
    // setEndTime: React.Dispatch<React.SetStateAction<number>>;
    // setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>;
    // setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>;
}

const shouldMoveToNextWord = (typedWord: string, keyPressed: string): boolean => {
    return typedWord && keyPressed === ' ';
}

const TypingArea = ({ 
    words, 
    setRandomizedWords, 
    setWpm
    // setStartTime, 
    // setEndTime, 
    // setCorrectCharacters, 
    // setIncorrectCharacters
}: TypingAreaProps): React.ReactElement => {
    const [currentWord, setCurrentWord] = useState(0);
    const [typedWord, setTypedWord] = useState("");
    const [wordComponents, setWordComponents] = useState<WordComponentData[]>(getWordComponentList(words));
    const [inputClass, setInputClass] = useState<string>("typing-input");
    const [typingStarted, setTypingStarted] = useState<boolean>(false);
    const [correctCharacters, setCorrectCharacters] = useState<number>(0);
    const [incorrectCharacters, setIncorrectCharacters] = useState<number>(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const resetStates = () => {
        setCurrentWord(0);
        setTypedWord("");
        getWordList().then(wordsList => {
            const newRandomizedWords = getRandomizedWordsList(wordsList);
            setRandomizedWords(newRandomizedWords);
            setWordComponents(getWordComponentList(newRandomizedWords));
        });
        setTypingStarted(false);
    }
    return (
        <div className="typing-container">
            <article className="typing-display">
                {
                    wordComponents.map((data: WordComponentData) => {
                        return <WordComponent 
                                    word={data.word} 
                                    key={data.id} 
                                    cssClass={data.cssClass} 
                                />
                    })
                }
            </article>
            <div className="input-row">
                <input 
                    type="text" 
                    value={typedWord}
                    className={inputClass}
                    onChange={(event: React.ChangeEvent) => {
                        if(!typingStarted) {
                            setStartTime(Date.now());
                            setTypingStarted(true);
                            console.log()
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
                                if(currentWord < wordComponents.length) {
                                    newWordComponents = [...newWordComponents].map((wordComponent, index) => {
                                        if(index === currentWord + 1) {
                                            return {...wordComponent, cssClass: "highlighted"};
                                        }
                                        return wordComponent;
                                    })
                                    setCurrentWord(currentWord + 1);
                                } else {
                                //     setStartTime(null);
                                    console.log('Total correct characters: ', getTotalCharacters(words))
                                    setEndTime(Date.now());
                                    setWpm(calculateWpm(startTime, endTime, correctCharacters, incorrectCharacters));
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

const getWordList = () => {
    return fetch('basic-words.json')
        .then(words => words.json())
        .then(json => json['english-basic']);
}

const getRandomizedWordsString = (wordList: string[]): string => {
    const length = 50;
    let result = "";
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * wordList.length);
        result += wordList[index] + " ";
    }
    console.log(result);
    return result;
}

/**
 * returns a list of selected words based on the type test parameters
 * @param wordList a list of words to choose from for type tests
 */
const getRandomizedWordsList = (wordList: string[]): string[] => {
    const length = 25;
    let result: string[] = [];
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * wordList.length);
        result.push(wordList[index]);
    }
    console.log(result);
    return result;
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
    const seconds = (endTime - startTime) / 1000;
    const wpm = (60 / seconds) * (correctCharacters - incorrectCharacters);
    console.log(`Correct characters: ${correctCharacters}. Incorrect characters: ${incorrectCharacters}.`);
    return endTime - startTime;
}

/**
 * should randomizedWords and wordsJson state live in TypingArea component since we only want that to rerender when
 * the words are reset?
 */
export const Landing: React.FC = (): React.ReactElement => {
    const [randomizedWords, setRandomizedWords] = useState<string[] | null>(null);
    // const [startTime, setStartTime] = useState<number | null>(null);
    // const [endTime, setEndTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState<number | null>(null);
    // const [correctCharacters, setCorrectCharacters] = useState<number | null>(null);
    // const [incorrectCharacters, setIncorrectCharacters] = useState<number | null>(null);

    // if(endTime) {
    //     setStartTime(null);
    //     setEndTime(null);
    //     setWpm(calculateWpm(startTime, endTime, correctCharacters, incorrectCharacters));
    // }

    useEffect(() => {
        const getWords = async () => {
            try {
                const wordsFile = await fetch('basic-words.json');
                const words = await wordsFile.json();
                setRandomizedWords(getRandomizedWordsList(words['english-basic']));
            } catch (e) {
                console.log(`Error getting words from json file! ${e}`);
            }
        };

        getWords();
    }, []);

    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                {randomizedWords &&
                    <TypingArea
                        words={randomizedWords}
                        setRandomizedWords={setRandomizedWords}
                        setWpm={setWpm}
                        // setStartTime={setStartTime}
                        // setEndTime={setEndTime}
                        // setCorrectCharacters={setCorrectCharacters}
                        // setIncorrectCharacters={setIncorrectCharacters}
                    />
                }
            </div>
        </div>
    );
};
