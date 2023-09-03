import React, { useEffect, useReducer, useState } from 'react';
import './landing.scss';
import { TypingArea } from '../../components/TypingArea';
import { WordsSource, WordsSources } from '../../services/words/words.interface';
import { ModeMenu } from '../../components/ModeMenu';
import { initialModeState, modeOptionsReducer } from '../../reducers/mode-reducer';
import { ObjectValues } from '../../models/models';


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
        </header>
    );
};

export const ExerciseActions = {
    EXERCISE_STARTED: 'EXERCISE_STARTED',
    EXERCISE_COMPLETE: 'EXERCISE_COMPLETE'
} as const;
type ExerciseAction = ObjectValues<typeof ExerciseActions>;
export interface ExerciseStatsState {
    wpm: number;
    accuracy: number;
}
interface ExerciseActionPayload {
}
export interface ExerciseStatsDispatchInput {
    type: ExerciseAction;
    payload?: Partial<ExerciseStatsState> & Partial<ExerciseActionPayload>
}

const exerciseStatsReducer = (state: ExerciseStatsState, action: ExerciseStatsDispatchInput) => {
    switch(action.type) {
        case(ExerciseActions.EXERCISE_STARTED): 
            return state;
        case(ExerciseActions.EXERCISE_COMPLETE):
            return {
                ...state,
                wpm: action.payload.wpm,
                accuracy: action.payload.accuracy 
            }
    }
}

// todo: see if words list should be passed into TypingArea component?

/**
 * should randomizedWords and wordsJson state live in TypingArea component since we only want that to rerender when
 * the words are reset?
 */
export const Landing = (): React.ReactElement => {

    // todo: put these into a reducer and pass callback for dispatching state update to TypingArea component
    const [wpm, setWpm] = useState<number | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [modeState, modeDispatch] = useReducer(modeOptionsReducer, initialModeState);
    const [exerciseStatsState, exerciseStatsDispatch] = useReducer(exerciseStatsReducer, { wpm: null, accuracy: null });

    useEffect(() => console.debug('Initial state: ', modeState), []);

    return (
        <div className="landing-container">
            <Header />
            <div>{exerciseStatsState.wpm}</div>
            <div className="body-container">
                <div id="center-area">
                    <ModeMenu 
                        state={modeState}
                        dispatch={modeDispatch}
                    />
                    <TypingArea
                        setWpm={setWpm}
                        setAccuracy={setAccuracy}
                        exerciseStatsDispatch={exerciseStatsDispatch}
                        modeState={modeState}
                    />
                </div>
            </div>
        </div>
    );
};
