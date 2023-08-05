import { WordComponentData } from "../../components/TypingArea";
import { WordsSource } from "../words/words.interface";
import { TypingExercise } from "./typing-exercise.abstract.service";
export const FixedWordExerciseLengths = {
    SHORT: 10,
    MEDIUM: 25,
    LONG: 50
} as const;
type ObjectValues<T> = T[keyof T];
export type FixedWordExerciseLength = ObjectValues<typeof FixedWordExerciseLengths>;

export class FixedWordsExercise extends TypingExercise {
    constructor(
        wordsSource: WordsSource,
        length: FixedWordExerciseLength,
        wordsComponent: WordComponentData[],
        currentWord: number,
        typedWord: string,
        inputClass: string,
        typingStarted: boolean,
        correctCharacters: number,
        incorrectCharacters: number,
        startTime: number | null,
        endTime: number | null,
        setWords: React.Dispatch<React.SetStateAction<string[]>>,
        setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>>,
        setCurrentWord: React.Dispatch<React.SetStateAction<number>>,
        setTypedWord: React.Dispatch<React.SetStateAction<string>>,
        setInputClass: React.Dispatch<React.SetStateAction<string>>,
        setTypingStarted: React.Dispatch<React.SetStateAction<boolean>>,
        setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setStartTime: React.Dispatch<React.SetStateAction<number | null>>,
        setEndTime: React.Dispatch<React.SetStateAction<number | null>>,
    ) {
        super(
            wordsSource,
            wordsComponent,
            currentWord,
            typedWord,
            inputClass,
            typingStarted,
            correctCharacters,
            incorrectCharacters,
            startTime,
            endTime,
            setWords,
            setWordComponents,
            setCurrentWord,
            setTypedWord,
            setInputClass,
            setTypingStarted,
            setCorrectCharacters,
            setIncorrectCharacters,
            setStartTime,
            setEndTime
        );

        this.words = this.wordsService.getRandomizedWords(length);
    }
}