import React from 'react';
import { ExerciseDispatchInput, ExerciseState, TypingActions } from '../reducers/exercise-reducer';
import { ModeState } from '../reducers/mode-reducer';
import { NextExercise, RedoExercise, PracticeMissedSlowWords, SaveToDifficultExercises } from '../inline-svgs';
import { IconButton } from './IconButton';
import { TypingModes } from '../models/models';
import { Tooltip } from './Tooltip';

interface ExerciseType {
    size: string;
    mode: string;
    source: string;
}
const getExerciseType = (state: ModeState, exerciseState: ExerciseState, quoteCitation: string): ExerciseType => {
    switch (state.mode) {
        case (TypingModes.FIXED):
            return {
                size: JSON.stringify(state.wordCount),
                mode: "words",
                source: state.wordsSource
            }
        case (TypingModes.TIMED):
            return {
                size: state.duration <= 60 ? JSON.stringify(state.duration) : JSON.stringify(state.duration / 60),
                mode: state.duration <= 60 ? "seconds" : "minutes",
                source: state.wordsSource,
            }
        case (TypingModes.QUOTES):
            return {
                size: state.quotesLength,
                mode: "quote",
                source: quoteCitation
            }
    }
}

/**
 * Should be a grid component where top part is the wpm / accuracy indicators with test type,
 * bottom part is the icon buttons for choosing what to do next
 * 
 * top part should take up 75% or more of the vertical space
 * 
 * needs to take in mode to display the correct exercise type
 */
const Stats = ({ exerciseState, modeState, nextExercise, retryExercise, practiceMissedWords, quoteCitation }:
    {
        exerciseState: ExerciseState,
        modeState: ModeState,
        nextExercise: React.MouseEventHandler,
        retryExercise: React.MouseEventHandler,
        practiceMissedWords: React.MouseEventHandler,
        quoteCitation: string
    }
): React.ReactElement => {

    const wpmDisplay = Math.floor(exerciseState.wpm);
    const accuracyDisplay = Math.floor(exerciseState.accuracy);

    const getExerciseName = (): React.ReactElement => {
        const exercise = getExerciseType(modeState, exerciseState, quoteCitation);
        if (modeState.mode === TypingModes.PRACTICE) {
            return (
                <span>practicing missed / slow words</span>
            );
        }
        return (
            <>
                <span>{exercise.size} {exercise.mode}</span>
                <span> - </span>
                <span>{exercise.source}</span>
            </>
        );
    }

    return (
        <section className='stats-container'>
            <div id="stats-display-container">
                <div id="big-stats">
                    <header className="stats-header">
                        <div>{wpmDisplay} wpm</div>
                    </header>
                    <div id="stats-divider"></div>
                    <header className="stats-header">{accuracyDisplay}% accuracy</header>
                </div>
                <div id="little-stats">
                    {getExerciseName()}
                </div>
            </div>
            <div id="summary-buttons-container">
                <Tooltip text='next exercise'>
                    <IconButton image={<NextExercise />} onClick={nextExercise} />
                </Tooltip>
                <Tooltip text='redo exercise'>
                    <IconButton image={<RedoExercise />} onClick={retryExercise} />
                </Tooltip>
                <Tooltip text='practice missed words'>
                    <IconButton image={<PracticeMissedSlowWords />} onClick={practiceMissedWords} />
                </Tooltip>
                <Tooltip text='save to difficult exercises'>
                    <IconButton image={<SaveToDifficultExercises />} />
                </Tooltip>
            </div>
        </section>
    );
}

export default Stats;