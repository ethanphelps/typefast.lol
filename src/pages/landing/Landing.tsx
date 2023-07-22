import React, { useEffect, useState } from 'react';
import './landing.scss';
import { getConfig } from '../../config';
import { getWordList, getRandomizedWordsList } from '../../services/words/words-service';
import { TypingArea } from '../../components/TypingArea';

const config = getConfig();
const LENGTH = 25;


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
        </header>
    );
};


// todo: see if words list should be passed into TypingArea component?

/**
 * should randomizedWords and wordsJson state live in TypingArea component since we only want that to rerender when
 * the words are reset?
 */
export const Landing: React.FC = (): React.ReactElement => {
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


    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                <TypingArea
                    // words={randomizedWords}
                    // setRandomizedWords={setRandomizedWords}
                    setWpm={setWpm}
                    // setStartTime={setStartTime}
                    // setEndTime={setEndTime}
                    // setCorrectCharacters={setCorrectCharacters}
                    // setIncorrectCharacters={setIncorrectCharacters}
                />
            </div>
        </div>
    );
};
