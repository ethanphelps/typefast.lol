import React from 'react';
import { DispatchInput, ExerciseState, TypingActions } from '../reducers/exercise-reducer';
import { ModeState } from '../reducers/mode-reducer';
import { NextExercise, RedoExercise, PracticeMissedSlowWords, SaveToDifficultExercises } from '../inline-svgs';
import { IconButton } from './IconButton';
import WordsService from '../services/words/words-service';
import { getWordDataList } from './TypingArea';
import { TypingModes } from '../models/models';

interface ExerciseType {
    size: string;
    mode: string;
    source: string;
}
const getExerciseType = (state: ModeState): ExerciseType => {
    let size, mode, source;
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
                source: state.quotesSource,
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
const Stats = ({ exerciseState, modeState, nextExercise, retryExercise, practiceMissedWords }:
    {
        exerciseState: ExerciseState,
        modeState: ModeState,
        nextExercise: React.MouseEventHandler,
        retryExercise: React.MouseEventHandler,
        practiceMissedWords: React.MouseEventHandler
    }
): React.ReactElement => {

    const wpmDisplay = Math.floor(exerciseState.wpm);
    const accuracyDisplay = Math.floor(exerciseState.accuracy);

    const getExerciseName = (): React.ReactElement => {
        const exercise = getExerciseType(modeState);
        if(modeState.mode === TypingModes.PRACTICE) {
            return (
                <span>practicing missed / slow words</span>
            );
        }
        return(
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
                    { getExerciseName() }
                </div>
            </div>
            <div id="summary-buttons-container">
                <IconButton image={<NextExercise />} onClick={nextExercise} />
                <IconButton image={<RedoExercise />} onClick={retryExercise} />
                <IconButton image={<PracticeMissedSlowWords />} onClick={practiceMissedWords} />
                <IconButton image={<SaveToDifficultExercises />} />
                {/* <div>next</div> */}
                {/* <div>redo</div>
                <div>practice</div>
                <div>save</div> */}
            </div>
        </section>
    );
}

export default Stats;