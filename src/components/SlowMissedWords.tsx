import React from 'react';
import { ExerciseState, WordData, getMistypedWords } from '../reducers/exercise-reducer';
import { IconButton } from './IconButton';
import { AddItem } from '../inline-svgs';

const WordListItem = ({ word, onClick }: { word: string, onClick: React.MouseEventHandler}) => {
    return (
        <li className="word-list-item">
            <div>{word}</div>
            <IconButton image={<AddItem />} onClick={onClick}/>
        </li>
    );
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
    const mistypedWords = getMistypedWords(exerciseState.wordData);
    const wordListItemClicked = (event: React.MouseEvent) => {
        console.log("word list item clicked!!!");
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
                        mistypedWords.map((word: WordData) => {
                            return <WordListItem word={word.word} onClick={wordListItemClicked} />
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
                        tempSlowWords.map((word: string) => <WordListItem word={word} onClick={wordListItemClicked} />)
                    }
                </ul>
            </section>
        </div>
    );
}

export default SlowMissedWords;