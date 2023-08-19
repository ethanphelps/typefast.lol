import React from 'react';

// TODO: highlighted vs untyped class for distinguishing current character from other characters
const WordComponent = ({ word, typedWord }: { word: string[], typedWord: string[] }): React.ReactElement => {
    return (
        <>
            {
                word.map((char: string, index: number) => {
                    let cssClass = "untyped";
                    if(index < typedWord.length) {
                        cssClass = typedWord[index] === char ? "correct" : "incorrect"
                    }
                    return <span className={cssClass} key={index}>{char}</span> // TODO: move comparison to reducer
                })
            }
            <span> </span>
        </>
    );
}

export default WordComponent;