import React, { useEffect, useReducer, useState } from 'react';
import './landing.scss';
import { TypingArea } from '../../components/TypingArea';
import { WordsSource, WordsSources } from '../../services/words/words.interface';
import { ModeMenu } from '../../components/ModeMenu';
import { initialModeState, modeOptionsReducer } from '../../reducers/mode-reducer';

const SOURCE: WordsSource = WordsSources.ENGLISH_BASIC;


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
export const Landing = (): React.ReactElement => {
    const [wpm, setWpm] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [source, setSource] = useState<WordsSource>(SOURCE);
    const [modeState, modeDispatch] = useReducer(modeOptionsReducer, initialModeState);

    useEffect(() => console.debug('Initial state: ', modeState), []);

    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                <div id="center-area">
                    <ModeMenu 
                        state={modeState}
                        dispatch={modeDispatch}
                    />
                    <TypingArea
                        setWpm={setWpm}
                        setAccuracy={setAccuracy}
                        modeState={modeState}
                        // mode={modeState.mode}
                        // fixedLength={LENGTH}
                        // source={source}
                    />
                </div>
            </div>
        </div>
    );
};
