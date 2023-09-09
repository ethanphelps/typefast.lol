// import { WordComponentData } from "../../components/TypingArea";
// import WordsService from "../words/words-service";
// import { TypingExercise } from "./typing-exercise.abstract.service";
// export const FixedWordExerciseLengths = {
//     SHORT: 10,
//     MEDIUM: 25,
//     LONG: 50,
//     EXTRA_LONG: 100,
//     SUPER_LONG: 250,
// } as const;
// type ObjectValues<T> = T[keyof T];
// export type FixedWordExerciseLength = ObjectValues<typeof FixedWordExerciseLengths>;

// export class FixedWordsExercise extends TypingExercise {
//     constructor(
//         wordsService: WordsService,
//         length: FixedWordExerciseLength,
//         wordComponents: WordComponentData[],
//         currentWord: number,
//         typedWord: string,
//         typedWords: string[],
//         inputClass: string,
//         typingStarted: boolean,
//         correctCharacters: number,
//         incorrectCharacters: number,
//         startTime: number | null,
//         endTime: number | null,
//         setWords: React.Dispatch<React.SetStateAction<string[]>>,
//         setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>>,
//         setCurrentWord: React.Dispatch<React.SetStateAction<number>>,
//         setTypedWord: React.Dispatch<React.SetStateAction<string>>,
//         setTypedWords: React.Dispatch<React.SetStateAction<string[]>>,
//         setInputClass: React.Dispatch<React.SetStateAction<string>>,
//         setTypingStarted: React.Dispatch<React.SetStateAction<boolean>>,
//         setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
//         setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
//         setStartTime: React.Dispatch<React.SetStateAction<number | null>>,
//         setEndTime: React.Dispatch<React.SetStateAction<number | null>>,
//     ) {
//         super(
//             wordsService,
//             wordComponents,
//             currentWord,
//             typedWord,
//             typedWords,
//             inputClass,
//             typingStarted,
//             correctCharacters,
//             incorrectCharacters,
//             startTime,
//             endTime,
//             setWords,
//             setWordComponents, // TODO: move setWordComponents to TypingArea
//             setCurrentWord,
//             setTypedWord,
//             setTypedWords,
//             setInputClass,
//             setTypingStarted,
//             setCorrectCharacters,
//             setIncorrectCharacters,
//             setStartTime,
//             setEndTime
//         );

//         this.words = this.wordsService.getRandomizedWords();
//     }
// }