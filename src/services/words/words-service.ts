import { WordsSource } from './words.interface';
import Words from './basic-words.json';
import { FixedWordExerciseLength } from '../../models/models';

// TODO: maybe make this just helper functions instead of a class
/**
 * Service for getting words from a source. Randomized words are stored as internal state and can 
 * be accessed by calling components via getRandomizedWords(). Calling components should call resetRandomizedWords()
 * when they want to get a new set of randomized words. Calling components should reinstantiate the service when the 
 * length of the exercise changes? This service should be memoized by the calling component to avoid repeated constructor
 * calls on every render.
 */
export default class WordsService {
    private words: string[] = [];
    private randomizedWords: string[] = [];

    constructor(source: WordsSource, length: FixedWordExerciseLength) {
        console.debug(`Initializing WordsService with source ${source}`);
        this.words = Words[source];
        this.resetRandomizedWords(length);
    }

    // TODO: make this generic based on the source of the words
    public resetRandomizedWords(length: FixedWordExerciseLength): void {
        console.debug(`Getting ${length} random words from ${this.words.length} words.`)
        let result: string[] = [];
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * this.words.length);
            result.push(this.words[index]);
        }
        console.debug(result);
        this.randomizedWords = result;
    }

    public getRandomizedWords(): string[] {
        return this.randomizedWords;
    }
}
