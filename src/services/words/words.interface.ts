import { ObjectValues } from "../../models/models";
export const WordsSources = {
    ENGLISH_BASIC: 'english-basic',
    ENGLISH_INTERMEDIATE: 'english-intermediate',
    ENGLISH_ADVANCED: 'english-advanced',
    ENGLISH_CONTRACTIONS: 'english-contractions',
    QUOTES_SHORT: 'quotes-short',
    QUOTES_MEDIUM: 'quotes-medium',
    QUOTES_LONG: 'quotes-long',
    DIFFICULT_WORDS: 'difficult-words',
} as const;
export type WordsSource = ObjectValues<typeof WordsSources>;


export interface Quote {
    text: string,
    source: string,
    length: number,
}

export interface Sections {
    S: string[],
    M: string[],
    L: string[],
    XL: string[],
}

export interface QuotesCollection {
    language: string,
    groups: number[][],
    sections: Sections,
    quotes: Record<string, Quote>
}