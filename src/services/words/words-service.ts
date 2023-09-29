import { QuotesCollection } from './words.interface';
import Words from './basic-words.json';
import { TypingModes } from '../../models/models';
import { ModeState } from '../../reducers/mode-reducer';
import _quotes from './quotes/english.json';
const Quotes = _quotes as QuotesCollection;
import * as Logger from '../../utils/logger';

/**
 * Service for getting words from a source. Randomized words are stored as internal state and can 
 * be accessed by calling components via getRandomizedWords(). Calling components should call resetRandomizedWords()
 * when they want to get a new set of randomized words. Calling components should reinstantiate the service when the 
 * length of the exercise changes? service should be memoized by the calling component to avoid repeated constructor
 * calls on every render.
 * 
 * TODO: add way to store source of quote for display during quotes mode 
 * 
 * TODO: convert to separate standalone functions instead of being a class
 */

const getRandomWords = (state: ModeState): string[] => {
    Logger.log('ModeState inside wordsService: ', state)
    Logger.debug(`Getting ${state.wordCount} random words from ${state.wordsSource}.`)
    let result: string[] = [];
    const words = Words[state.wordsSource];
    for (let i = 0; i < state.wordCount; i++) {
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
    // dispatch({
    //     type: TypingActions.QUOTE_SET,
    //     payload: {
    //         quoteCitation: quote.source
    //     }
    // })
    setQuoteCitation(quote.source);
    const quoteWordArray = quote.text.split(' ');
    Logger.debug('QUOTE: ', quoteWordArray);
    return quoteWordArray;
}

// export const getWords = (state: ModeState, dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ExerciseState, ExerciseDispatchInput>>>): string[] => {
export const getWords = (state: ModeState, setQuoteCitation: React.Dispatch<React.SetStateAction<string>>): string[] => {
    if(state.mode === TypingModes.FIXED || state.mode === TypingModes.TIMED || state.mode === TypingModes.FREEFORM) {
        return getRandomWords(state);
    } else if(state.mode === TypingModes.QUOTES) {
        return getQuote(state, setQuoteCitation);
    }
    return [""];
}
