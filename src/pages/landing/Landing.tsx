import React, { useEffect, useState } from 'react';
import './landing.scss';
import { getConfig } from '../../config';
import { TypingArea } from '../../components/TypingArea';
import { ObjectValues, TypingMode, TypingModes } from '../../models/models';
import { FixedWordExerciseLength, FixedWordExerciseLengths } from '../../models/models';
import { WordsSource, WordsSources } from '../../services/words/words.interface';
import { ModeMenu } from '../../components/ModeMenu';

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

const ModeActions = {
    RESET: 'reset',
    TYPING_STARTED: 'typing-started',
    WORD_COMPLETE: 'word-complete',
    WORD_DELETED: 'word-deleted',
    CHARACTER_TYPED: 'character-typed',
    CHARACTER_DELETED: 'character-deleted', // may be superfluous 
    EXERCISE_COMPLETE: 'exercise-complete'
} as const;
type ModeAction = ObjectValues<typeof ModeActions>;
// this may cause issues polluting state with non state fields in the reducer
interface ActionPayload {
    characterTyped: string;
    inputValue: string;
}
interface DispatchInput {
    type: ModeAction;
    payload?: Partial<ModeState> & Partial<ActionPayload>;
}
export interface ModeState {
    mode: TypingMode;
    length: FixedWordExerciseLength;
    source: WordsSource;
    punctuation: boolean;
    numbers: boolean;
    forceCorrections: boolean;
}
const reducer = (state: ModeState, dispatch: DispatchInput): ModeState => {
    return state;
}


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
                <div id="center-area">
                    <ModeMenu />
                    <TypingArea
                        setWpm={setWpm}
                        setAccuracy={setAccuracy}
                        mode={TypingModes.FIXED}
                        fixedLength={LENGTH}
                        source={source}
                    />
                </div>
            </div>
        </div>
    );
};
