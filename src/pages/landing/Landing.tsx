import React, { useEffect, useState } from 'react';
import './landing.scss';
import { getConfig } from '../../config';
import { TypingArea } from '../../components/TypingArea';
import { TypingModes } from '../../models/models';
import { FixedWordExerciseLength, FixedWordExerciseLengths } from '../../services/exercises/fixed-words-exercise.service';
import { WordsSource, WordsSources } from '../../services/words/words.interface';
import WordsService from '../../services/words/words-service';

const config = getConfig();
const LENGTH: FixedWordExerciseLength = FixedWordExerciseLengths.MEDIUM;
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
export const Landing: React.FC = (): React.ReactElement => {
    const [wpm, setWpm] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [source, setSource] = useState<WordsSource>(SOURCE);

    return (
        <div className="landing-container">
            <Header />
            <div className="body-container">
                <TypingArea
                    setWpm={setWpm}
                    setAccuracy={setAccuracy}
                    mode={TypingModes.COUNT}
                    fixedLength={LENGTH}
                    source={source}
                />
            </div>
        </div>
    );
};
