import Words from './basic-words.json';

export const getWordList = (): string[] => {
    return Words['english-basic'];
}

/**
 * returns a list of selected words based on the type test parameters
 * @param wordList a list of words to choose from for type tests
 */
export const getRandomizedWordsList = (wordList: string[], length: number): string[] => {
    let result: string[] = [];
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * wordList.length);
        result.push(wordList[index]);
    }
    console.log(result);
    return result;
}