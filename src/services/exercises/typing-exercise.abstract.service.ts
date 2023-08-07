import React from "react";
import { WordComponentData } from "../../components/TypingArea";
import WordsService from "../words/words-service";

const deleteInputTypes = ['deleteContentBackward', 'deleteWordBackward', 'deleteSoftLineBackward', 'deleteHardLineBackward'];

export abstract class TypingExercise {
    private wpm: number | null = null;
    private setWpm: React.Dispatch<React.SetStateAction<number | null>> = () => { };
    private accuracy: number | null = null;
    private setAccuracy: React.Dispatch<React.SetStateAction<number | null>> = () => { };
    protected words: string[] = [];
    protected setWords: React.Dispatch<React.SetStateAction<string[]>> = () => { };
    private wordComponents: WordComponentData[] = [];
    private setWordComponents: React.Dispatch<React.SetStateAction<WordComponentData[]>> = () => { };
    private currentWord: number = 0;
    private setCurrentWord: React.Dispatch<React.SetStateAction<number>> = () => { };
    private typedWord: string = "";
    private setTypedWord: React.Dispatch<React.SetStateAction<string>> = () => { };
    private typedWords: string[] = [];
    private setTypedWords: React.Dispatch<React.SetStateAction<string[]>> = () => { };
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
        wordsService: WordsService,
        wordComponents: WordComponentData[],
        currentWord: number,
        typedWord: string,
        typedWords: string[],
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
        setTypedWords: React.Dispatch<React.SetStateAction<string[]>>,
        setInputClass: React.Dispatch<React.SetStateAction<string>>,
        setTypingStarted: React.Dispatch<React.SetStateAction<boolean>>,
        setCorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setIncorrectCharacters: React.Dispatch<React.SetStateAction<number>>,
        setStartTime: React.Dispatch<React.SetStateAction<number | null>>,
        setEndTime: React.Dispatch<React.SetStateAction<number | null>>
    ) {
        this.wordsService = wordsService;
        this.wordComponents = wordComponents;
        this.currentWord = currentWord;
        this.typedWord = typedWord;
        this.typedWords = typedWords;
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
        console.debug("constructor called!");

        // this.words = this.wordsService.getRandomizedWords(length);
        // this.resetStates();
    }

    public resetStates() {
        this.setCurrentWord(0);
        this.setTypedWord("");
        this.setWords(this.words);
        this.setWordComponents(this.getWordComponentList(this.words));
        this.setInputClass("typing-input");
        this.setTypingStarted(false);
        this.setCorrectCharacters(0);
        this.setIncorrectCharacters(0);
        this.setStartTime(null);
        this.setEndTime(null);
        this.setTypedWords(this.words.map(() => ""));
    }

    // function that takes in all the state values from TypingArea and updates the internal states of the exercise
    public updateInternalStates(
        wordComponents: WordComponentData[],
        currentWord: number,
        typedWord: string,
        typedWords: string[],
        inputClass: string,
        typingStarted: boolean,
        correctCharacters: number,
        incorrectCharacters: number,
        startTime: number | null,
        endTime: number | null,
    ) {
        this.wordComponents = wordComponents;
        this.currentWord = currentWord;
        this.typedWord = typedWord;
        this.typedWords = typedWords;
        this.inputClass = inputClass;
        this.typingStarted = typingStarted;
        this.correctCharacters = correctCharacters;
        this.incorrectCharacters = incorrectCharacters;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public handleInput(event: React.ChangeEvent) {
        console.debug(`STATES AT BEGINNING OF HANDLE INPUT: `);
        this.debugStates();
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
            console.debug(`STATES AT END OF HANDLE INPUT: `);
            this.debugStates();
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
        console.debug(`STATES AT END OF HANDLE INPUT: `);
        this.debugStates();
    }

    protected isDelete (event: React.ChangeEvent, inputValue: string): boolean {
        return deleteInputTypes.includes((event.nativeEvent as InputEvent).inputType) || inputValue.length < this.typedWord.length;
    }

    /**
     * returns incremental correctness of the word as user is typing
     */
    protected wordIsCorrect(targetWord: string, typedWord: string) {
        if (typedWord.length < targetWord.length) {
            for (let i = 0; i < typedWord.length; i++) {
                if (typedWord[i] !== targetWord[i]) {
                    return false;
                }
            }
            return true;
        }
        return typedWord.trim() === targetWord;
    }

    // TODO: add force correctness mode, but that would just affect the overall correctness, not whether you can move to the next word or not
    protected shouldMoveToNextWord (typedWord: string, keyPressed: string): boolean {
        return typedWord && keyPressed === ' ';
    }

    protected handleWordComplete (inputValue: string) {
        console.log('next word! word typed was: ', inputValue);
        this.updateTypedWords(inputValue)
        const correct = inputValue === this.words[this.currentWord];
        if (correct) {
            console.log('word was typed correctly!');
        } else {
            console.log(`word was typed incorrectly! word should have been: ${this.words[this.currentWord]}. word typed: ${this.typedWord}`);
        }
        let updatedWordComponents = this.updateWordComponents(correct);
        if (this.currentWord + 1 < this.wordComponents.length) {
            updatedWordComponents = this.setNextHighlightedWord(updatedWordComponents);
            this.setCurrentWord(this.currentWord + 1);
        } else {
            // extract into own function for finalizing type test and calculating wpm
            const finalTypedWords = [...this.typedWords]; // need local variable for final typed words since typedWords state is not updated until next render is complete
            finalTypedWords[this.currentWord] = inputValue;
            const totalCharacters = this.getTotalCharacters(this.words);
            const correctCharacters = this.getCorrectCharacters(this.words, finalTypedWords);
            console.log(`number of words: ${this.words.length}. current word: ${this.currentWord + 1}`);
            console.log('Total characters: ', totalCharacters)
            this.setEndTime(Date.now());
            this.setWpm(this.calculateWpm(this.startTime, Date.now(), correctCharacters, this.incorrectCharacters));
            this.setAccuracy(this.calculateNaiveAccuracy(totalCharacters, correctCharacters));
            this.setCurrentWord(this.currentWord + 1);
        }
        this.setTypedWord("");
        this.setWordComponents(updatedWordComponents);
        this.setInputClass("typing-input")
    }

    protected updateTypedWords (inputValue: string) {
        console.log(`updating typed words with ${inputValue} at the ${this.currentWord} index`);
        const updatedTypedWords = [...this.typedWords];
        updatedTypedWords[this.currentWord] = inputValue;
        this.setTypedWords(updatedTypedWords);
    }

    protected handleDeletion (inputValue: string) {
        console.log('DELETE');
        if (this.typedWord.length === 0) {
            return;
        }
        this.setTypedWord(inputValue);
        // decrement correct/incorrect characters based on how much was deleted and which characters were deleted
        // need a way of telling which characters in typed word are correct/incorrect and where their location in the word is
    }

    /**
     * updates the css class of the typed word to reflect whether it was typed correctly or not
     */
    protected updateWordComponents (correct: boolean): WordComponentData[] {
        const newClassName = correct ? "correct" : "incorrect";
        let updatedWordComponents = [...this.wordComponents];
        updatedWordComponents[this.currentWord] = {
            ...updatedWordComponents[this.currentWord],
            cssClass: newClassName
        }
        return updatedWordComponents;
    }

    protected setNextHighlightedWord (wordComponents: WordComponentData[]) {
        const updatedWordComponents = [...wordComponents];
        updatedWordComponents[this.currentWord + 1] = {
            ...updatedWordComponents[this.currentWord + 1],
            cssClass: "highlighted"
        }
        return updatedWordComponents;
    }

    /**
     * collects selected words into an array of span components
     * @param selectedWords the words chosen from the list for this type test
     */
    protected getWordComponentList (selectedWords: string[]): WordComponentData[] {
        const components = selectedWords.map((word: string, index: number) => {
            return {
                id: index,
                word: word,
                cssClass: ""
            }
        });
        components[0] = { ...components[0], cssClass: "highlighted" };
        return components;
    }

    /**
     * WPM = characters per min / 5
     * @param startTime 
     * @param endTime 
     * @param wordCount 
     * @returns 
     */
    protected calculateWpm (startTime: number, endTime: number, correctCharacters: number, incorrectCharacters: number) {
        console.log(`start time: ${startTime}, end time: ${endTime}`);
        const seconds = (endTime - startTime) / 1000;
        const fractionOfMinute = seconds / 60;
        const wordsTyped = correctCharacters / 5;
        const wpm3 = wordsTyped / fractionOfMinute;
        console.log('seconds: ', seconds);
        const wpm = (1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters) / 5);
        const wpm2 = ((1 / (seconds / 60)) * ((correctCharacters - incorrectCharacters))) / 5;
        console.log('wpm: ', wpm);
        console.log('wpm2: ', wpm2);
        console.log('wpm3: ', wpm3);
        console.log(`Correct characters: ${correctCharacters}. Incorrect characters: ${incorrectCharacters}.`);
        return wpm3;
    }

    protected calculateNaiveAccuracy (totalCharacters: number, correctCharacters: number) {
        return (correctCharacters / totalCharacters) * 100;
    }

    protected getTotalCharacters (words: string[]): number {
        return words.reduce((sum: number, word: string) => sum + word.length + 1, 0);
    }

    protected getCorrectCharacters (words: string[], typedWords: string[]): number {
        console.log('typed words: ', typedWords);
        let sum = 0;
        for (let i = 0; i < typedWords.length; i++) {
            if (typedWords[i] === words[i]) {
                sum += typedWords[i].length + 1;
            } else {
                console.log(`mistyped word at index ${i}. typed word: ${typedWords[i]}. correct word: ${words[i]}`);
            }
        }
        console.log('correct characters: ', sum);
        return sum;
    }

    private debugStates() {
        console.debug("words: ", this.words);
        console.debug("wordComponents: ", this.wordComponents);
        console.debug("currentWord: ", this.currentWord);
        console.debug("typedWord: ", this.typedWord);
        console.debug("typedWords: ", this.typedWords);
        console.debug("inputClass: ", this.inputClass);
        console.debug("typingStarted: ", this.typingStarted);
        console.debug("correctCharacters: ", this.correctCharacters);
        console.debug("incorrectCharacters: ", this.incorrectCharacters);
        console.debug("startTime: ", this.startTime);
        console.debug("endTime: ", this.endTime);
    }

}