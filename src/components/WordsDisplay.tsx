// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { ExerciseState, WordData } from "../reducers/exercise-reducer";
// import WordComponent from "./Word";
// import * as Logger from "../utils/logger";

// const ROW_SIZE = 85;
// const ROW_SPAN = 2;

// /**
//  * Display words on three rows. Once last word on second row is typed, scroll words by one line.
//  * How do we handle responsive UI that shrinks below specific size? Would need to detect how many words are 
//  * rendered on a specific line and manage state accordingly
//  * 
//  * Add separate state property called DisplayedWords that represents the words that should be displayed on the screen at any given time.
//  * Update this state value when middle line is finished being typed
//  * 
//  * See if there's a way to detect in code when a line break happens. In this case, just scroll words displayed once second line is typed.
//  * hide any overflow so only three lines are ever appearing
//  * 
//  * line currently appears to be 93 characters long. find max number of words that can be displayed without going over
//  * if a word causes max to go over, push it to the next line. display three distinct lines instead of mapping words into one div.
//  * Calculate start/end indices of rows instead of maintaining a separate list of words. 
//  * Track typing index to know when user has gone over row limit - this can just be currentWord
//  */
// export const WordsDisplay = ({ state }: { state: ExerciseState}): React.ReactElement => {
//     const typingDisplay = useRef(null);
//     // let [startRowOne, setStartRowOne] = useState<number>(0);
//     // let [startRowTwo, setStartRowTwo] = useState<number>(getNextRowStartIndex(startRowOne, state.wordData));
//     // let [startRowThree, setStartRowThree] = useState<number>(getNextRowStartIndex(startRowTwo, state.wordData));
//     // let [stopIndex, setStopIndex] = useState<number>(getNextRowStartIndex(startRowThree, state.wordData));

//     // let [rowOne, rowTwo, rowThree] = useMemo<WordData[][]>(() => [
//     //     state.wordData.slice(startRowOne, startRowTwo),
//     //     state.wordData.slice(startRowTwo, startRowThree),
//     //     state.wordData.slice(startRowThree, stopIndex)
//     // ], [startRowOne, startRowTwo, startRowThree, stopIndex]);
//     // let [rowOne, rowTwo, rowThree] = function() {
//     //     return [
//     //         state.wordData.slice(startRowOne, startRowTwo),
//     //         state.wordData.slice(startRowTwo, startRowThree),
//     //         state.wordData.slice(startRowThree, stopIndex)
//     //     ]
//     // }();

//     // Logger.debug(`Row 1 start index: ${startRowOne}. Row 2 start index: ${startRowTwo}. Row 3 start index: ${startRowThree}`);
//     // Logger.debug("Row 1: ", rowOne);
//     // Logger.debug("Row 2: ", rowTwo);
//     // Logger.debug("Row 3: ", rowThree);
    
//     // if(state.currentWord >= startRowThree) {
//     //     setStartRowOne(startRowTwo);
//     //     setStartRowTwo(startRowThree);
//     //     setStartRowThree(stopIndex);
//     //     setStopIndex(getNextRowStartIndex(startRowThree, state.wordData))
//     // }

//     // useEffect(() => {
//     //     Logger.debug("ROWS SHIFTED!");
//     // }, [startRowTwo, startRowThree]);

//     const findLineBreaks = (): number[] => {
//         const children = typingDisplay.current.children as HTMLElement[];
//         const rowStartIndices: number[] = [0];
//         if(children.length > 0) {
//             let rowHeight = children[0].getBoundingClientRect().top;
//             for(let i = 0; i < children.length; i++) {
//                 const child = children[i];
//                 if(child.getBoundingClientRect().top !== rowHeight) {
//                     rowStartIndices.push(i);
//                     rowHeight = child.getBoundingClientRect().top;
//                 }
//             }
//         }
//         Logger.log('Row start indices: ', rowStartIndices);
//         const firstWordsOnEachRow = rowStartIndices.map(i => state.words[i]);
//         Logger.log('First words on each row: ', firstWordsOnEachRow);
//         return rowStartIndices;
//     }

//     useEffect(() => {
//         findLineBreaks();
//     }, [state.wordData])

//     return (
//         <article className="typing-display" ref={typingDisplay}>
//             {/* <div className="typing-line">
//                 {
//                     rowOne.length > 0
//                         ? rowOne.map((data: WordData, index: number) => {
//                         return <WordComponent
//                             word={data.wordCharArray}
//                             typedWord={data.typedCharArray}
//                             wordIndex={data.id}
//                             currentWord={state.currentWord}
//                             key={data.id}
//                         />
//                     })
//                     : null

//                 }
//             </div>
//             <div className="typing-line">
//                 {
//                     rowTwo.length > 0
//                         ? rowTwo.map((data: WordData, index: number) => {
//                         return <WordComponent
//                             word={data.wordCharArray}
//                             typedWord={data.typedCharArray}
//                             wordIndex={data.id}
//                             currentWord={state.currentWord}
//                             key={data.id}
//                         />
//                     })
//                     : null

//                 }
//             </div>
//             <div className="typing-line">
//                 {
//                     rowThree.length > 0
//                         ? rowThree.map((data: WordData, index: number) => {
//                         return <WordComponent
//                             word={data.wordCharArray}
//                             typedWord={data.typedCharArray}
//                             wordIndex={data.id}
//                             currentWord={state.currentWord}
//                             key={data.id}
//                         />
//                     })
//                     : null

//                 }
//             </div> */}
//             {
//                 state.wordData
//                     ? state.wordData.slice(
//                             state.rowStartIndices[state.rowOffset], 
//                             state.rowStartIndices[state.rowOffset + ROW_SPAN]
//                         ).map((data: WordData) => {
//                         return <WordComponent
//                             word={data.wordCharArray}
//                             typedWord={data.typedCharArray}
//                             wordIndex={data.id}
//                             currentWord={state.currentWord}
//                             renderClass="hidden"
//                             key={data.id}
//                         />
//                     })
//                     : null
//             }
//             {/* {
//                 state.wordData
//                     ? state.wordData.map((data: WordData, index: number) => {
//                         return <WordComponent
//                             word={data.wordCharArray}
//                             typedWord={data.typedCharArray}
//                             wordIndex={data.id}
//                             currentWord={state.currentWord}
//                             key={data.id}
//                         />
//                     })
//                     : null
//             } */}
//         </article>
//     );
// }





// const getNextRowStartIndex = (prevStart: number, wordData: WordData[]): number => {
//     let pointer = prevStart;
//     let length = 0;
//     for(let i = prevStart; i < wordData.length; i++) {
//         length += wordData[i].word.length;
//         if(length > ROW_SIZE) {
//             break;
//         }
//         pointer = i;
//     }
//     return pointer + 1;
// }