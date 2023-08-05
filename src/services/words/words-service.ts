import { WordsSource } from './words.interface';
import Words from './basic-words.json';

export default class WordsService {
    private words: string[] = [];

    constructor(source: WordsSource) {
        this.words = Words[source];
    }

    public getRandomizedWords(length: number): string[] {
        let result: string[] = [];
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * this.words.length);
            result.push(this.words[index]);
        }
        console.log(result);
        return result;
    }
}
