import React, { useEffect, useState } from 'react';
import './landing.scss';
import { getConfig } from '../../config';
import { getWordList, getRandomizedWordsList } from '../../services/words/words-service';
import { TypingArea } from '../../components/TypingArea';
import { TypingMode } from '../../models/models';

const config = getConfig();
const LENGTH = 50;


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
    const [wpm, setWpm] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);

    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                <TypingArea
                    setWpm={setWpm}
                    setAccuracy={setAccuracy}
                    mode={TypingMode.COUNT}
                    fixedLength={LENGTH}
                />
            </div>
        </div>
    );
};
