import React from 'react';
import { ExerciseState, MissedWords, getMistypedWords } from '../reducers/exercise-reducer';
import { IconButton } from './IconButton';
import { AddItem } from '../inline-svgs';
import * as Logger from "../utils/logger";

// TODO: change duration notation to (x2)
const WordListItem = ({ word, onClick, count }: { word: string, onClick: React.MouseEventHandler, count?: number}) => {
    return (
        <li className="word-list-item">
            <div className="missed-word">
                <div>{word}</div>
                {
                    count && count > 1 ? 
                        <div className="missed-count">{`(x${count})`}</div>
                        : <></>
                }
            </div>
            <IconButton image={<AddItem />} onClick={onClick}/>
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
    const wordListItemClicked = (event: React.MouseEvent) => {
        Logger.log("word list item clicked!!!");
    }
    const tempSlowWords = ["just", "a", "test"];
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
                    <h3>slow words</h3>
                </div>
                <div>
                    <div className="horizontal-divider"></div>
                </div>
                <ul>
                    <WordListItem word={"exceptionalism"} onClick={wordListItemClicked} />
                    {
                        tempSlowWords.map((word: string, index: number) => <WordListItem word={word} onClick={wordListItemClicked} key={index}/>)
                    }
                </ul>
            </section>
        </div>
    );
}

export default SlowMissedWords;