import React from 'react';
import * as Logger from "../utils/logger";

/**
 * TODO: highlighted vs untyped class for distinguishing current character from other characters
 * TODO: maybe move cssClass for each character to WordData so they don't have to be recomputed each time the word is rendered
 * TODO: figure out how to only re-render the word being typed, instead of every word in the words list. If the words list is long, this will be innefficient
 * (could useMemo help with this?)
*/
const WordComponent = ({ word, typedWord, wordIndex, currentWord, renderClass }: { word: string[], typedWord: string[], wordIndex: number, currentWord: number, renderClass: string }): React.ReactElement => {
    // Logger.log("WordComponent rendered");
    let displayedWord = word;
    if(typedWord.length > word.length) {
        displayedWord = [...word, ...typedWord.slice(word.length - typedWord.length)];
    }
    let spaceClass = null;
    if(currentWord === wordIndex && typedWord.length >= word.length) {
        spaceClass = "highlighted";
    }

    return (
        <span>
            {
                displayedWord.map((char: string, index: number) => {
                    let cssClass = "untyped";
                    if(index < typedWord.length) {
                        cssClass = typedWord[index] === char ? "correct" : "incorrect"
                    }
                    if(currentWord === wordIndex && index === typedWord.length) {
                        cssClass = "highlighted";
                    }
                    if(index >= word.length) {
                        cssClass = "incorrect";
                    }
                    cssClass += ` ${renderClass}`;
                    return <span className={cssClass} key={index}>{char}</span> // TODO: move comparison to reducer
                })
            }
            <span className={spaceClass}> </span>
        </span>
    );
}

export default WordComponent;