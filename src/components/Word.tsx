import React from 'react';

/**
 * TODO: highlighted vs untyped class for distinguishing current character from other characters
 * TODO: maybe move cssClass for each character to WordData so they don't have to be recomputed each time the word is rendered
 * TODO: figure out how to make remaining characters in the word red when use presses space too early
 * TODO: figure out how to only re-render the word being typed, instead of every word in the words list. If the words list is long, this will be innefficient
 * (could useMemo help with this?)
*/
const WordComponent = ({ word, typedWord }: { word: string[], typedWord: string[] }): React.ReactElement => {
    console.log("WordComponent rendered");
    let displayedWord = word;
    if(typedWord.length > word.length) {
        displayedWord = [...word, ...typedWord.slice(word.length - typedWord.length)];
    }
    return (
        <>
            {
                displayedWord.map((char: string, index: number) => {
                    let cssClass = "untyped";
                    if(index < typedWord.length) {
                        cssClass = typedWord[index] === char ? "correct" : "incorrect"
                    }
                    if(index >= word.length) {
                        cssClass = "incorrect";
                    }
                    return <span className={cssClass} key={index}>{char}</span> // TODO: move comparison to reducer
                })
            }
            <span> </span>
        </>
    );
}

export default WordComponent;