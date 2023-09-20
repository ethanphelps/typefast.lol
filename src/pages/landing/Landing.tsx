import React, { useEffect, useMemo, useReducer } from 'react';
import './landing.scss';
import { TypingArea, getWordDataList } from '../../components/TypingArea';
import { WordsSource, WordsSources } from '../../services/words/words.interface';
import { ModeMenu } from '../../components/ModeMenu';
import { MODE_STATE, ModeState, initialModeState, modeOptionsReducer } from '../../reducers/mode-reducer';
import WordsService from '../../services/words/words-service';
import { ExerciseState, ExerciseStatus, ExerciseStatusValue, exerciseReducer } from '../../reducers/exercise-reducer';
import Stats from '../../components/Stats';
import SlowMissedWords from '../../components/SlowMissedWords';


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
    const [modeState, modeDispatch] = useReducer(
        modeOptionsReducer,
        initialModeState,
        (initialModeState: ModeState): ModeState => {
            const sessionState = sessionStorage.getItem(MODE_STATE);
            const parsedState: Partial<ModeState> = sessionState ? JSON.parse(sessionState) : {};
            return {
                ...initialModeState,
                ...parsedState
            }
        }
    );

    const wordsService = useMemo(() => {
        return new WordsService(modeState);
    }, [modeState.wordCount, modeState.wordsSource, modeState.mode, modeState.quotesLength, modeState.quotesSource]);



    /**
     * ExerciseState with a dispatch function where state is lazily initialized to the result of wordsService.getRandomizedWords()
     * Unless there's a page refresh, wordsService will always be the initial value returned by useMemo even if props changing causes
     * TypingArea to rerender... That's why state.wordsData isn't getting updated. Need to explicitly update state when wordsService changes
     * via useEffect
     */
    const [state, dispatch] = useReducer(
        exerciseReducer,
        wordsService,
        (wordsService: WordsService): ExerciseState => {
            console.log("setting initial states for the reducers!");
            return {
                status: ExerciseStatus.COMPLETE,
                words: wordsService.getWords(),
                wordData: getWordDataList(wordsService.getWords()),
                currentWord: 0,
                cursor: 0,
                typingStarted: false,
                correctCharacters: 0,
                incorrectCharacters: 0,
                startTime: null,
                endTime: null,
                canType: true,
                wpm: null,
                accuracy: null
            }
        }
    )
    
    const displayClass = ([ExerciseStatus.READY, ExerciseStatus.IN_PROGRESS] as ExerciseStatusValue[]).includes(state.status) ? "body-container typing" : "body-container";

    return (
        <div className="landing-container">
            <Header />
            <div className={displayClass}>
                <div id="center-area">
                    <section className="section">
                        {
                            state.status === ExerciseStatus.COMPLETE ? 
                            <Stats exerciseState={state} modeState={modeState} wordsService={wordsService} dispatch={dispatch} />
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
                                />
                                : <></>
                            }
                        </div>
                        <TypingArea
                            state={state}
                            dispatch={dispatch}
                            modeState={modeState}
                            wordsService={wordsService}
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
