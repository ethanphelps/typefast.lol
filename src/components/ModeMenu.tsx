import React, { useEffect, useState } from 'react';
import './landing.scss';

// const config = getConfig();
// const LENGTH: FixedWordExerciseLength = FixedWordExerciseLengths.MEDIUM;
// const SOURCE: WordsSource = WordsSources.ENGLISH_BASIC;


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
        </header>
    );
};


// todo: see if words list should be passed into TypingArea component?

/**
 * 
 */
export const ModeMenu: React.FC = (): React.ReactElement => {
    const [wpm, setWpm] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);

    return (
        <div className="landing-container">
        </div>
    );
};
