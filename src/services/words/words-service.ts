import { QuotesCollection } from './words.interface';
import Words from './basic-words.json';
import { TypingModes, WordsSourceLabelValue } from '../../models/models';
import { ModeState } from '../../reducers/mode-reducer';
import _quotes from './quotes/english.json';
const Quotes = _quotes as QuotesCollection;
import * as Logger from '../../utils/logger';

const TIMED_MODE_INITIAL_WORD_COUNT = 75;

/**
 * Service for getting words from a source. Randomized words are stored as internal state and can 
 * be accessed by calling components via getRandomizedWords(). Calling components should call resetRandomizedWords()
 * when they want to get a new set of randomized words. Calling components should reinstantiate the service when the 
 * length of the exercise changes? service should be memoized by the calling component to avoid repeated constructor
 * calls on every render.
 * 
 * TODO: add way to store source of quote for display during quotes mode 
 */

export const getRandomWords = (source: WordsSourceLabelValue, count: number): string[] => {
    Logger.debug(`Getting ${count} random words from ${source}.`)
    let result: string[] = [];
    const words = Words[source];
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * words.length);
        result.push(words[index]);
    }
    return result;
}

// const getQuote = (state: ModeState, dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, ExerciseDispatchInput>>>): string[] => {
const getQuote = (state: ModeState, setQuoteCitation: React.Dispatch<React.SetStateAction<string>>): string[] => {
    Logger.debug(`Getting a ${state.quotesLength} quote!`);
    const randomIndex = Math.floor(Math.random() * Quotes['sections'][state.quotesLength].length);
    Logger.debug(`Random index: ${randomIndex}`);
    const quoteId = Quotes['sections'][state.quotesLength][randomIndex];
    const quote = Quotes['quotes'][quoteId];
    setQuoteCitation(quote.source);
    const quoteWordArray = quote.text.split(' ');
    Logger.debug('QUOTE: ', quoteWordArray);
    return quoteWordArray;
}

/**
 * TODO: extract conditional logic from here and into Landing component. It's out of scope of the words service
 */
export const getWords = (state: ModeState, setQuoteCitation: React.Dispatch<React.SetStateAction<string>>): string[] => {
    Logger.log('ModeState inside wordsService: ', state);
    if(state.mode === TypingModes.FIXED) {
        return getRandomWords(state.wordsSource, state.wordCount);
    } else if(state.mode === TypingModes.TIMED) {
        return getRandomWords(state.wordsSource, TIMED_MODE_INITIAL_WORD_COUNT);
    } else if(state.mode === TypingModes.QUOTES) {
        return getQuote(state, setQuoteCitation);
    }
    return [""];
}
