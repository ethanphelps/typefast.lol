import React from 'react';

/**
 * This component should be a grid with two halves: one that shows mistyped words and one
 * that shows slow words. This section should be able to expand downwards indefinitely 
 * 
 * This section should have a minimum height set so that in the event of no missed words and a short test,
 * the section still looks normal
 */
const SlowMissedWords = ({ word, typedWord, wordIndex, currentWord }: { word: string[], typedWord: string[], wordIndex: number, currentWord: number }): React.ReactElement => {
    
    return (
        <>
        </>
    );
}

export default SlowMissedWords;