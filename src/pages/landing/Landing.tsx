import React, { useEffect, useState, Suspense } from 'react';
import './landing.scss';
import { Add, Search } from '../../inline-svgs';
import Link from '../../components/Link';
import { Recipe } from '../../models/models';
import { getConfig } from '../../config';
import { suspenseWrapper } from '../../utils/suspenseWrapper';

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
            {/* <section className="header-buttons">
                <IconButton image={<Search />} />
                <IconButton image={<Add />} path="/new" />
            </section> */}
        </header>
    );
};

const wordsToType = [""];

interface TypingAreaProps {
    words: string
}


const TypingArea = ({ words }: TypingAreaProps): React.ReactElement => {
    return (
        <div className="typing-container">
            <article className="typing-display">
                {words}
            </article>
            <input type="text" className="typing-input"></input>
        </div>
    );
}

const getRandomizedWords = (wordList: string[]): string => {
    const length = 50;
    let result = "";
    for(let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * wordList.length);
        result += wordList[index] + " ";
    }
    console.log(result);
    return result;
}

interface WordsJson {
   [key: string]: string[]
}
export const Landing: React.FC = (): React.ReactElement => {
    const [wordsJson, setWordsJson] = useState<WordsJson | null>(null);
    const [randomizedWords, setRandomizedWords] = useState<string | null>(null);

    useEffect(() => {
        const getWords = async () => {
            try {
                const wordsFile = await fetch('basic-words.json');
                const words = await wordsFile.json();
                setRandomizedWords(getRandomizedWords(words['english-basic']));
                setWordsJson(words);
            } catch(e) {
                console.log(`Error getting words from json file! ${e}`);
            }
        };

        getWords();
    }, []);

    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                { wordsJson && 
                    <TypingArea words={randomizedWords}/>
                }
            </div>
        </div>
    );
};
