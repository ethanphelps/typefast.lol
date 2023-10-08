import React, { useEffect, useMemo, useReducer, useState } from 'react';
import './landing.scss';
import { TypingArea, getWordDataList } from '../../components/TypingArea';
import { ModeMenu } from '../../components/ModeMenu';
import { MODE_STATE, ModeActions, ModeState, initialModeState, modeOptionsReducer } from '../../reducers/mode-reducer';
import { ExerciseState, ExerciseStatus, ExerciseStatusValue, MissedWords, TypingActions, exerciseReducer, getMistypedWords } from '../../reducers/exercise-reducer';
import Stats from '../../components/Stats';
import SlowMissedWords from '../../components/SlowMissedWords';
import { OptionCategories, TypingModes } from '../../models/models';
import * as WordsService from '../../services/words/words-service';
import * as Logger from '../../utils/logger';

const PRACTICE_WORD_REPEAT_COUNT = 8;


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
        </header>
    );
};


export const Landing = (): React.ReactElement => {
    const [quoteCitation, setQuoteCitation] = useState<string>("");

    const [modeState, modeDispatch] = useReducer(
        modeOptionsReducer,
        initialModeState,
        (initialModeState: ModeState): ModeState => {
            const sessionState = sessionStorage.getItem(MODE_STATE);
            const parsedState: Partial<ModeState> = sessionState ? JSON.parse(sessionState) : {};
            if(OptionCategories.MODE.value in parsedState && parsedState.mode === TypingModes.PRACTICE) {
                parsedState.mode = parsedState.modePriorToPractice || TypingModes.FIXED;
            }
            return {
                ...initialModeState,
                ...parsedState
            }
        }
    );


    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     * Unless there's a page refresh, wordsService will always be the initial value returned by useMemo even if props changing causes
     * TypingArea to rerender... That's why state.wordsData isn't getting updated. Need to explicitly update state when wordsService changes
     * via useEffect
     */
    const [state, dispatch] = useReducer(
        exerciseReducer,
        null, // this may get called every time Landing is rerendered but it's okay bc only initial value is ever used. rest are ignored
        (): ExerciseState => {
            Logger.log("setting initial states for the reducers!");
            const words = WordsService.getWords(modeState, setQuoteCitation);
            return {
                status: ExerciseStatus.READY,
                words: words,
                wordData: getWordDataList(words),
                currentWord: 0,
                cursor: 0,
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null,
                partialReattemptStartTime: null,
                canType: true,
                wpm: null,
                accuracy: null,
                quoteCitation: ""
            }
        }
    )
    


    // TODO: should this just be explicitly done right when the mode is set, rather than asynchronously after the mode changes causes a re-render?
    // could be a reason for combining reducers
    useEffect(() => {
        if(modeState.mode !== TypingModes.PRACTICE) {
            const newWords = WordsService.getWords(modeState, setQuoteCitation);
            dispatch({
                type: TypingActions.RESET,
                payload: {
                    words: newWords,
                    wordData: getWordDataList(newWords)
                }
            });
        }
    }, [modeState.wordCount, modeState.wordsSource, modeState.mode, modeState.quotesLength, modeState.quotesSource]);

    const dispatchNewWords = () => {
        Logger.log("DISPATCH NEW WORDS CALLED");
        const newWords = WordsService.getWords(modeState, setQuoteCitation); // TODO: make words service just some functions that you can import. it doesn't need to be a full class
        dispatch({
            type: TypingActions.RESET,
            payload: {
                words: newWords,
                wordData: getWordDataList(newWords)
            }
        });
    }

    const nextExercise = () => {
        const newWords = WordsService.getWords(modeState, setQuoteCitation);
        modeDispatch({ 
            type: ModeActions.MODE_SET,
            payload: {
                mode: modeState.modePriorToPractice // should this only happen if the current mode is practice?
            }
        })
        dispatch({
            type: TypingActions.RESET,
            payload: {
                words: newWords,
                wordData: getWordDataList(newWords)
            }
        });
    }

    const retryExercise = () => {
        dispatch({
            type: TypingActions.RESET,
            payload: {
                words: state.words,
                wordData: getWordDataList(state.words)
            }
        });
    }
    
    const practiceMissedWords = () => {
        const mistypedWords = getMistypedWords(state.wordData);
        if(Object.keys(mistypedWords).length === 0) {
            Logger.debug("You haven't missed any words!!!");
            return;
        }
        const practiceWords = getPracticeWords(mistypedWords);
        modeDispatch({
            type: ModeActions.MODE_SET,
            payload: {
                mode: TypingModes.PRACTICE
            }
        })
        dispatch({
            type: TypingActions.RESET,
            payload: {
                words: practiceWords,
                wordData: getWordDataList(practiceWords)
            }
        });
    }

    // TODO: move this into a utils file of functions 
    const getPracticeWords = (mistypedWords: MissedWords): string[] => {
        const newWordsList = Object.keys(mistypedWords).reduce((result: string[], current: string) => {
            const repetitions = Array(PRACTICE_WORD_REPEAT_COUNT).fill(current);
            return result.concat(repetitions);
        }, []);
        for(let i = newWordsList.length-1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i));
            [newWordsList[i], newWordsList[j]] = [newWordsList[j], newWordsList[i]];
        }
        return newWordsList;
    }
    
    const displayClass = ([ExerciseStatus.READY, ExerciseStatus.IN_PROGRESS] as ExerciseStatusValue[]).includes(state.status) ? "body-container typing" : "body-container";

    return (
        <div className="landing-container">
            <Header />
            <div className={displayClass}>
                <div id="center-area">
                    <section className="section">
                        {
                            state.status === ExerciseStatus.COMPLETE ? 
                            <Stats 
                                exerciseState={state} 
                                modeState={modeState} 
                                nextExercise={nextExercise} 
                                retryExercise={retryExercise} 
                                practiceMissedWords={practiceMissedWords} 
                                quoteCitation={quoteCitation}
                            />
                            : <></>
                        }
                    </section>
                    <section id="typing-area-section" className="section">
                        <div id="mode-menu-wrapper">
                            {
                                state.status === ExerciseStatus.READY ? 
                                <ModeMenu
                                    state={modeState}
                                    dispatch={modeDispatch}
                                    dispatchNewWords={dispatchNewWords}
                                    // dispatchNewWords={() => {}}
                                />
                                : <></>
                            }
                        </div>
                        <TypingArea
                            state={state}
                            dispatch={dispatch}
                            modeState={modeState}
                        />
                    </section>
                    <section className="section">
                        {
                            state.status === ExerciseStatus.COMPLETE ? 
                            <SlowMissedWords exerciseState={state} />
                            : <></>
                        }
                    </section>
                    <section className="section">
                        {
                            state.status === ExerciseStatus.COMPLETE ? 
                            <div></div>
                            : <></>
                        }
                    </section>
                </div>
            </div>
        </div>
    );
};
