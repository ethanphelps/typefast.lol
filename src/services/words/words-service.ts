import { QuotesCollection, WordsSource } from './words.interface';
import Words from './basic-words.json';
import { FixedWordExerciseLength, FixedWordExerciseLengthValue, TypingMode, TypingModes } from '../../models/models';
import { ModeState } from '../../reducers/mode-reducer';
import _quotes from './quotes/english.json';
const Quotes = _quotes as QuotesCollection;

// TODO: maybe make this just helper functions instead of a class
/**
 * Service for getting words from a source. Randomized words are stored as internal state and can 
 * be accessed by calling components via getRandomizedWords(). Calling components should call resetRandomizedWords()
 * when they want to get a new set of randomized words. Calling components should reinstantiate the service when the 
 * length of the exercise changes? This service should be memoized by the calling component to avoid repeated constructor
 * calls on every render.
 * 
 * TODO: add way to store source of quote for display during quotes mode 
 */
export default class WordsService {
    private state: ModeState;

    constructor(modeState: ModeState) {
        console.debug(`Initializing WordsService with source ${modeState.wordsSource}`);
        this.state = modeState;
    }

    private getRandomWords(): string[] {
        console.log('ModeState inside wordsService: ', this.state)
        console.debug(`Getting ${this.state.wordCount} random words from ${this.state.wordsSource}.`)
        let result: string[] = [];
        const words = Words[this.state.wordsSource];
        for (let i = 0; i < this.state.wordCount; i++) {
            const index = Math.floor(Math.random() * words.length);
            result.push(words[index]);
        }
        return result;
    }

    private getQuote(): string[] {
        console.debug(`Getting a ${this.state.quotesLength} quote!`);
        const randomIndex = Math.floor(Math.random() * Quotes['sections'][this.state.quotesLength].length);
        console.debug(`Random index: ${randomIndex}`);
        const quoteId = Quotes['sections'][this.state.quotesLength][randomIndex];
        const quote = Quotes['quotes'][quoteId];
        const quoteWordArray = quote.text.split(' ');
        console.debug('QUOTE: ', quoteWordArray);
        return quoteWordArray;
    }

    public getWords(): string[] {
        if(this.state.mode === TypingModes.FIXED || this.state.mode === TypingModes.TIMED || this.state.mode === TypingModes.FREEFORM) {
            return this.getRandomWords();
        } else if(this.state.mode === TypingModes.QUOTES) {
            return this.getQuote();
        }
        return [""];
    }

}
