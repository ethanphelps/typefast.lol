import { ObjectValues } from "../../models/models";
export const WordsSources = {
    ENGLISH_BASIC: 'english-basic',
    ENGLISH_INTERMEDIATE: 'english-intermediate',
    ENGLISH_ADVANCED: 'english-advanced',
    QUOTES_SHORT: 'quotes-short',
    QUOTES_MEDIUM: 'quotes-medium',
    QUOTES_LONG: 'quotes-long',
} as const;
export type WordsSource = ObjectValues<typeof WordsSources>;