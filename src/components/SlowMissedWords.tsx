import React from 'react';
import { ExerciseState, MissedWords, WordData, getMistypedWords } from '../reducers/exercise-reducer';
import { IconButton } from './IconButton';
import { AddItem } from '../inline-svgs';
import * as Logger from "../utils/logger";
import { Tooltip } from './Tooltip';


const WordListItem = ({ word, onClick, count, wpm }: { word: string, onClick: React.MouseEventHandler, count?: number, wpm?: number }) => {
    return (
        <li className="word-list-item">
            <div className="missed-word">
                <div>{word}</div>
                {
                    count && count > 1 ? 
                        <div className="missed-count">{`(x${count})`}</div>
                        : <></>
                }
                {
                    wpm ? 
                        <div className="missed-count">{`${Math.floor(wpm)} wpm`}</div>
                        : <></>
                }
            </div>
            <Tooltip text="add to difficult words">
                <IconButton image={<AddItem />} onClick={onClick}/>
            </Tooltip>
        </li>
    );
}

const sortMistypedWords = (words: MissedWords): [string, number][] => {
    let wordsList = Object.entries(words);
    const comparator = (a: [string, number], b: [string, number]): number => {
        return b[1] - a[1]
    }
    return wordsList.sort(comparator);
}

// figure out what stats to use to calculate this - maybe only words a certain number of standard deviations from the mean wpm 
const getSlowWords = (state: ExerciseState): [string, number][] => {
    const SLOW_THRESHOLD = 0.15;
    const slowCount = Math.ceil(state.wordData.length * SLOW_THRESHOLD);
    const sortedWords = [...state.wordData].sort((a, b) => a.wpm - b.wpm);
    
    const slowWords: Record<string, number> = {};
    sortedWords.slice(0, slowCount).forEach((word: WordData) => {
        const wpm = slowWords[word.word];
        if((wpm && word.wpm < wpm) || !wpm) {
            slowWords[word.word] = word.wpm
        }
    })
    return Object.entries(slowWords);
}

/**
 * This component should be a grid with two halves: one that shows mistyped words and one
 * that shows slow words. This section should be able to expand downwards indefinitely 
 * 
 * This section should have a minimum height set so that in the event of no missed words and a short test,
 * the section still looks normal
 * 
 * create a component for each row
 */
const SlowMissedWords = ({ exerciseState }: { exerciseState: ExerciseState }): React.ReactElement => {
    const mistypedWords = sortMistypedWords(getMistypedWords(exerciseState.wordData));
    const slowWords = getSlowWords(exerciseState);
    const wordListItemClicked = (event: React.MouseEvent) => {
        Logger.log("word list item clicked!!!");
    }
    return (
        <div id="slow-missed-words-container">
            <section id="missed-words" className="typefast-card words-list">
                <div>
                    <h3>missed words</h3>
                </div>
                <div>
                    <div className="horizontal-divider"></div>
                </div>
                <ul>
                    {
                        mistypedWords.map((word, index: number) => {
                            return <WordListItem word={word[0]} onClick={wordListItemClicked} count={word[1]} key={index}/>
                        })
                    }
                </ul>
            </section>
            <section id="slow-words" className="typefast-card words-list">
                <div>
                    <h3>slowest words</h3>
                </div>
                <div>
                    <div className="horizontal-divider"></div>
                </div>
                <ul>
                    {
                        slowWords.map((word: [string, number], index: number) => <WordListItem word={word[0]} wpm={word[1]} onClick={wordListItemClicked} key={index}/>)
                    }
                </ul>
            </section>
        </div>
    );
}

export default SlowMissedWords;