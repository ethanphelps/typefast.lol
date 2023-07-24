import React from "react";
import { WordComponentData } from "../../components/TypingArea";

export class TypingService {
    private words: string[] = [];
    private setWords: React.Dispatch<React.SetStateAction<string[]>> = () => {};
    private wordsComponent: WordComponentData[] = [];
    private setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>> = () => {};
    private currentWord: number = 0;
    private setCurrentWord: React.Dispatch<React.SetStateAction<number>> = () => {};
    private typedWord: string = "";
    private setTypedWord: React.Dispatch<React.SetStateAction<string>> = () => {};
    private inputClass: string = "typing-input";
    private setInputClass: React.Dispatch<React.SetStateAction<string>> = () => {};
    private typingStarted: boolean = false;
    private setTypingStarted: React.Dispatch<React.SetStateAction<boolean>> = () => {};
    private correctCharacters: number = 0;
    private setCorrectCharacters: React.Dispatch<React.SetStateAction<number>> = () => {};
    private incorrectCharacters: number = 0;
    private setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>> = () => {};
    private startTime: number | null = null;
    private setStartTime: React.Dispatch<React.SetStateAction<number | null>> = () => {};
    private endTime: number | null = null;
    private setEndTime: React.Dispatch<React.SetStateAction<number | null>> = () => {};

    constructor(
        words: string[],
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
        setEndTime: React.Dispatch<React.SetStateAction<number | null>>
    ) {
        this.words = words;
        this.wordsComponent = wordsComponent;
        this.currentWord = currentWord;
        this.typedWord = typedWord;
        this.inputClass = inputClass;
        this.typingStarted = typingStarted;
        this.correctCharacters = correctCharacters;
        this.startTime = startTime;
        this.incorrectCharacters = incorrectCharacters;
        this.endTime = endTime;
        this.setWords = setWords;
        this.setWordComponents = setWordComponents;
        this.setCurrentWord = setCurrentWord;
        this.setTypedWord = setTypedWord;
        this.setInputClass = setInputClass;
        this.setTypingStarted = setTypingStarted;
        this.setCorrectCharacters = setCorrectCharacters;
        this.setIncorrectCharacters = setIncorrectCharacters;
        this.setStartTime = setStartTime;
        this.setEndTime = setEndTime;
    }

    handleInput(event: React.ChangeEvent) {
        console.log('handle input')
    }
}