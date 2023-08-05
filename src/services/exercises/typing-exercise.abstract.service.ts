import React from "react";
import { WordComponentData } from "../../components/TypingArea";
import WordsService from "../words/words-service";
import { WordsSource } from "../words/words.interface";

export abstract class TypingExercise {
    protected words: string[] = [];
    protected setWords: React.Dispatch<React.SetStateAction<string[]>> = () => { };
    private wordsComponent: WordComponentData[] = [];
    private setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>> = () => { };
    private currentWord: number = 0;
    private setCurrentWord: React.Dispatch<React.SetStateAction<number>> = () => { };
    private typedWord: string = "";
    private setTypedWord: React.Dispatch<React.SetStateAction<string>> = () => { };
    private inputClass: string = "typing-input";
    private setInputClass: React.Dispatch<React.SetStateAction<string>> = () => { };
    private typingStarted: boolean = false;
    private setTypingStarted: React.Dispatch<React.SetStateAction<boolean>> = () => { };
    private correctCharacters: number = 0;
    private setCorrectCharacters: React.Dispatch<React.SetStateAction<number>> = () => { };
    private incorrectCharacters: number = 0;
    private setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>> = () => { };
    private startTime: number | null = null;
    private setStartTime: React.Dispatch<React.SetStateAction<number | null>> = () => { };
    private endTime: number | null = null;
    private setEndTime: React.Dispatch<React.SetStateAction<number | null>> = () => { };
    protected wordsService: WordsService;

    constructor(
        wordsSource: WordsSource,
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
        setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>>, // TODO: move setWordComponents to TypingArea
        setCurrentWord: React.Dispatch<React.SetStateAction<number>>,
        setTypedWord: React.Dispatch<React.SetStateAction<string>>,
        setInputClass: React.Dispatch<React.SetStateAction<string>>,
        setTypingStarted: React.Dispatch<React.SetStateAction<boolean>>,
        setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setStartTime: React.Dispatch<React.SetStateAction<number | null>>,
        setEndTime: React.Dispatch<React.SetStateAction<number | null>>
    ) {
        this.wordsService = new WordsService(wordsSource);
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

        setCurrentWord(0);
        setTypedWord("");
        const newRandomizedWords = getRandomizedWordsList(getWordList(), fixedLength); // TODO: move into typing service
        setWords(newRandomizedWords);
        setWordComponents(getWordComponentList(newRandomizedWords));
        setInputClass("typing-input");
        setTypingStarted(false);
        setCorrectCharacters(0);
        setIncorrectCharacters(0);
        setStartTime(null);
        setEndTime(null);
        setTypedWords(newRandomizedWords.map(() => ""));
    }

    handleInput(event: React.ChangeEvent) {
        if (this.currentWord >= this.words.length) {
            return;
        }
        if (!this.typingStarted) {
            this.setStartTime(Date.now());
            this.setTypingStarted(true);
            console.log(Date.now());
        }
        const inputValue = (event.target as HTMLInputElement).value;
        console.log((event.nativeEvent as InputEvent).inputType);
        if (this.isDelete(event, inputValue)) {
            this.handleDeletion(inputValue);
            return; // should we return here?
        }
        const characterTyped = this.isDelete(event, inputValue) ? null : inputValue[inputValue.length - 1];

        const newInputClass = this.wordIsCorrect(this.words[this.currentWord], inputValue) ? "typing-input" : "typing-input incorrect-input";
        this.setInputClass(newInputClass);

        let characterChange = 0;
        if (characterTyped !== " ") {
            characterChange = inputValue.length < this.typedWord.length ? -1 : 1;
        }
        // this logic is flawed bc it doesn't account for how many characters were deleted in one motion and how many were correct/incorrect
        if (this.wordIsCorrect(this.words[this.currentWord], inputValue)) {
            this.setCorrectCharacters(this.correctCharacters + characterChange);
            console.log('correct characters typed: ', this.correctCharacters);
        } else {
            this.setIncorrectCharacters(this.incorrectCharacters + characterChange)
            console.log('incorrect characters typed: ', this.incorrectCharacters);
        }

        this.setTypedWord(inputValue);

        // check if word correct incrementally
        if (this.shouldMoveToNextWord(inputValue, characterTyped)) {
            this.handleWordComplete(inputValue.trim());
        }

    }
}