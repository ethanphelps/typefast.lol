import { ModeAction, ModeActions, ModeState, ModeStateProperties, ModeStateProperty } from "../reducers/mode-reducer";
import { WordsSources } from "../services/words/words.interface";

export const TypingModes = {
    FIXED: 'fixed',
    TIMED: 'timed',
    QUOTES: 'quotes',
    FREEFORM: 'freeform',
    PRACTICE: 'practice'
} as const;
export type ObjectValues<T> = T[keyof T];
export type TypingMode = ObjectValues<typeof TypingModes>;


export const OptionCategories = {
    COUNT: { value: 'count', display: 'count' },
    DURATION: { value: 'duration', display: 'duration' },
    LENGTH: { value: 'length', display: 'length' },
    PUNCTUATION: { value: 'punctuation', display: 'punctuation' },
    NUMBERS: { value: 'numbers', display: 'numbers' },
    WORDS_SOURCE: { value: 'wordsSource', display: 'source' },
    QUOTES_SOURCE: { value: 'quotesSource', display: 'source' },
    PRACTICE_SOURCE: { value: 'practiceSource', display: 'source' },
    FORCE_CORRECTIONS: { value: 'force corrections', display: 'force corrections' },
    PRACTICE_FORMAT: { value: 'format', display: 'format' }
} as const;
type OptionCategoriesType = typeof OptionCategories;
export type OptionCategory = ObjectValues<OptionCategoriesType>;
export type OptionCategoryValue = OptionCategoriesType[keyof OptionCategoriesType]['value'];
export type OptionCategoryDisplay = OptionCategoriesType[keyof OptionCategoriesType]['display'];


// export const FixedWordExerciseLengths = {
//     SHORT: 10,
//     MEDIUM: 25,
//     LONG: 50,
//     EXTRA_LONG: 100,
//     SUPER_LONG: 250,
// } as const;
// export type FixedWordExerciseLength = ObjectValues<typeof FixedWordExerciseLengths>;
export const FixedWordExerciseLengths = {
    SHORT: { value: 10, display: 10 },
    MEDIUM: { value: 25, display: 25 },
    LONG: { value: 50, display: 50 },
    EXTRA_LONG: { value: 100, display: 100 },
    SUPER_LONG: { value: 250, display: 250 },
} as const;
type FixedWordExerciseLengthOptions = typeof FixedWordExerciseLengths;
export type FixedWordExerciseLength = ObjectValues<FixedWordExerciseLengthOptions>;
export type FixedWordExerciseLengthValue = FixedWordExerciseLengthOptions[keyof FixedWordExerciseLengthOptions]['value'];
export type FixedWordExerciseLengthDisplay = FixedWordExerciseLengthOptions[keyof FixedWordExerciseLengthOptions]['display'];


export const TimedExerciseDurations = {
    SHORT: { value: 10, display: '10s' },
    MEDIUM: { value: 30, display: '30s' },
    LONG: { value: 60, display: '60s' },
    EXTRA_LONG: { value: 120, display: '2m' },
    SUPER_LONG: { value: 300, display: '5m' },
} as const;
type TimedExerciseDurationOptions = typeof TimedExerciseDurations;
export type TimedExerciseDuration = ObjectValues<TimedExerciseDurationOptions>
export type TimedExerciseDurationValue = TimedExerciseDurationOptions[keyof TimedExerciseDurationOptions]['value']
export type TimedExerciseDurationDisplay = TimedExerciseDurationOptions[keyof TimedExerciseDurationOptions]['display']


export const QuotesExerciseLengths = {
    SHORT: { value: 'S', display: 'S' },
    MEDIUM: { value: 'M', display: 'M' },
    LONG: { value: 'L', display: 'L' },
    EXTRA_LONG: { value: 'XL', display: 'XL' },
} as const;
type QuotesExerciseLengthOptions = typeof QuotesExerciseLengths;
export type QuotesExerciseLength = ObjectValues<typeof QuotesExerciseLengths>;
export type QuotesExerciseLengthValue = QuotesExerciseLengthOptions[keyof QuotesExerciseLengthOptions]['value'];
export type QuotesExerciseLengthDisplay = QuotesExerciseLengthOptions[keyof QuotesExerciseLengthOptions]['display'];


export const PunctuationOptions = {
    ON: { value: true, display: 'on' },
    OFF: { value: false, display: 'off' }
} as const;
type PunctuationOptionOptions = typeof PunctuationOptions;
export type PunctuationOption = ObjectValues<typeof PunctuationOptions>;
export type PunctuationOptionValue = PunctuationOptionOptions[keyof PunctuationOptionOptions]['value'];
export type PunctuationOptionDisplay = PunctuationOptionOptions[keyof PunctuationOptionOptions]['display'];


export const NumberOptions = {
    ON: { value: true, display: 'on' },
    OFF: { value: false, display: 'off' }
} as const;
type NumberOptionOptions = typeof NumberOptions;
export type NumberOption = ObjectValues<typeof NumberOptions>;
export type NumberOptionValue = NumberOptionOptions[keyof NumberOptionOptions]['value'];
export type NumberOptionDisplay = NumberOptionOptions[keyof NumberOptionOptions]['display'];


export const ForceCorrectionsOptions = {
    ON: { value: true, display: 'on' },
    OFF: { value: false, display: 'off' }
} as const;
type ForceCorrectionOptionOptions = typeof ForceCorrectionsOptions;
export type ForceCorrectionsOption = ObjectValues<typeof ForceCorrectionsOptions>;
export type ForceCorrectionOptionValue = ForceCorrectionOptionOptions[keyof ForceCorrectionOptionOptions]['value'];
export type ForceCorrectionOptionDisplay = ForceCorrectionOptionOptions[keyof ForceCorrectionOptionOptions]['display'];


export const WordsSourceLabels = {
    BASIC: { value: WordsSources.ENGLISH_BASIC, display: 'basic' },
    INTERMEDIATE: { value: WordsSources.ENGLISH_INTERMEDIATE, display: 'intermediate' },
    ADVANCED: { value: WordsSources.ENGLISH_ADVANCED, display: 'advanced' },
    CONTRACTIONS: { value: WordsSources.ENGLISH_CONTRACTIONS, display: 'contractions' },
    DIFFICULT_WORDS: { value: WordsSources.DIFFICULT_WORDS, display: 'my difficult words' },
} as const;
type WordsSourceLabelOptions = typeof WordsSourceLabels;
export type WordsSourceLabel = ObjectValues<typeof WordsSourceLabels>;
export type WordsSourceLabelValue = WordsSourceLabelOptions[keyof WordsSourceLabelOptions]['value'];
export type WordsSourceLabelDisplay = WordsSourceLabelOptions[keyof WordsSourceLabelOptions]['display'];


export const QuotesSourceLabels = {
    BOOKS: { value: 'books', display: 'books' },
    POEMS: { value: 'poems', display: 'poems' },
    SONGS: { value: 'songs', display: 'songs' },
    ALL: { value: 'all', display: 'all' }
} as const;
type QuotesSourceLabelOptions = typeof QuotesSourceLabels;
export type QuotesSourceLabel = ObjectValues<typeof QuotesSourceLabels>;
export type QuotesSourceLabelValue = QuotesSourceLabelOptions[keyof QuotesSourceLabelOptions]['value'];
export type QuotesSourceLabelDisplay = QuotesSourceLabelOptions[keyof QuotesSourceLabelOptions]['display'];


export const PracticeFormats = {
    RANDOM: { value: 'random', display: 'random' },
    REPETITION: { value: 'repetition', display: 'repetition' },
} as const;
type PracticeFormatOptions = typeof PracticeFormats;
export type PracticeFormat = ObjectValues<typeof PracticeFormats>;
export type PracticeFormatValue = PracticeFormatOptions[keyof PracticeFormatOptions]['value'];
export type PracticeFormatDisplay = PracticeFormatOptions[keyof PracticeFormatOptions]['display'];


export const PracticeSourceLabels = {
    DIFFICULT_WORDS: { value: 'difficult words', display: 'difficult words' },
    MOST_MISSED: { value: 'most missed', display: 'most missed' },
    CUSTOM: { value: 'custom', display: 'custom' }
} as const;
type PracticeSourceLabelOptions = typeof PracticeSourceLabels;
export type PracticeSourceLabel = ObjectValues<typeof PracticeSourceLabels>;
export type PracticeSourceLabelValue = PracticeSourceLabelOptions[keyof PracticeSourceLabelOptions]['value'];
export type PracticeSourceLabelDisplay = PracticeSourceLabelOptions[keyof PracticeSourceLabelOptions]['display'];


/**
 * Maps a given option category to the list of items it should display. An item configuration has a state value and a display value
 */
export type OptionItemConfiguration = FixedWordExerciseLength | TimedExerciseDuration | QuotesExerciseLength | PunctuationOption | NumberOption | WordsSourceLabel | QuotesSourceLabel | ForceCorrectionsOption | PracticeFormat | PracticeSourceLabel;
export type OptionItemValue = FixedWordExerciseLengthValue | TimedExerciseDurationValue | QuotesExerciseLengthValue | PunctuationOptionValue | NumberOptionValue | WordsSourceLabelValue | QuotesSourceLabelValue | ForceCorrectionOptionValue | PracticeFormatValue | PracticeSourceLabelValue;
export const OptionValuesByCategory: Record<OptionCategoryValue, OptionItemConfiguration[]> = {
    [OptionCategories.COUNT.value]: Object.values(FixedWordExerciseLengths),
    [OptionCategories.DURATION.value]: Object.values(TimedExerciseDurations),
    [OptionCategories.LENGTH.value]: Object.values(QuotesExerciseLengths),
    [OptionCategories.PUNCTUATION.value]: Object.values(PunctuationOptions),
    [OptionCategories.NUMBERS.value]: Object.values(NumberOptions),
    [OptionCategories.WORDS_SOURCE.value]: Object.values(WordsSourceLabels),
    [OptionCategories.QUOTES_SOURCE.value]: Object.values(QuotesSourceLabels),
    [OptionCategories.PRACTICE_SOURCE.value]: Object.values(PracticeSourceLabels),
    [OptionCategories.FORCE_CORRECTIONS.value]: Object.values(ForceCorrectionsOptions),
    [OptionCategories.PRACTICE_FORMAT.value]: Object.values(PracticeFormats)
} as const;


/**
 * For displaying the option category titles for a given mode on the right half of the mode options view 
 */
export const ModeOptions: Record<TypingMode, OptionCategory[]> = {
    [TypingModes.FIXED]: [OptionCategories.COUNT, OptionCategories.PUNCTUATION, OptionCategories.NUMBERS, OptionCategories.WORDS_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.TIMED]: [OptionCategories.DURATION, OptionCategories.PUNCTUATION, OptionCategories.NUMBERS, OptionCategories.WORDS_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.QUOTES]: [OptionCategories.LENGTH, OptionCategories.QUOTES_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.FREEFORM]: [],
    [TypingModes.PRACTICE]: [OptionCategories.PRACTICE_FORMAT, OptionCategories.PRACTICE_SOURCE],
};


/**
 * For mapping category names to corresponding state properties
 * TODO: figure out WHY using ModeStateProperties gives a runtime type error: Uncaught TypeError: Cannot read properties of undefined (reading FIXED)
 */
// export const StatePropertiesByCategory: Record<OptionCategoryValue, ModeStateProperty> = {
//     [OptionCategories.COUNT.value]: ModeStateProperties.WORD_COUNT,
//     [OptionCategories.DURATION.value]: ModeStateProperties.DURATION,
//     [OptionCategories.LENGTH.value]: ModeStateProperties.QUOTES_LENGTH,
//     [OptionCategories.PUNCTUATION.value]: ModeStateProperties.PUNCTUATION,
//     [OptionCategories.NUMBERS.value]: ModeStateProperties.NUMBERS,
//     [OptionCategories.WORDS_SOURCE.value]: ModeStateProperties.WORDS_SOURCE,
//     [OptionCategories.QUOTES_SOURCE.value]: ModeStateProperties.QUOTES_SOURCE,
//     [OptionCategories.PRACTICE_SOURCE.value]: ModeStateProperties.PRACTICE_SOURCE,
//     [OptionCategories.FORCE_CORRECTIONS.value]: ModeStateProperties.FORCE_CORRECTIONS,
//     [OptionCategories.PRACTICE_FORMAT.value]: ModeStateProperties.PRACTICE_FORMAT
export const StatePropertiesByCategory: Record<OptionCategoryValue, keyof ModeState> = {
    [OptionCategories.COUNT.value]: "wordCount",
    [OptionCategories.DURATION.value]: "duration",
    [OptionCategories.LENGTH.value]: "wordCount",
    [OptionCategories.PUNCTUATION.value]: "punctuation",
    [OptionCategories.NUMBERS.value]: "numbers",
    [OptionCategories.WORDS_SOURCE.value]: "wordsSource",
    [OptionCategories.QUOTES_SOURCE.value]: "quotesSource",
    [OptionCategories.PRACTICE_SOURCE.value]: "practiceSource",
    [OptionCategories.FORCE_CORRECTIONS.value]: "forceCorrections",
    [OptionCategories.PRACTICE_FORMAT.value]: "practiceFormat"
} as const;


// // using ModeActions const object here also causes the runtime webpack error :( Using it inside mode-reducer does NOT cause an error???
// export const ModeActionsByCategory: Record<OptionCategoryValue, ModeAction> = {
//     // [OptionCategories.COUNT.value]: ModeActions.WORD_COUNT_SET,
//     // [OptionCategories.DURATION.value]: ModeActions.DURATION_SET,
//     // [OptionCategories.LENGTH.value]: ModeActions.QUOTES_LENGTH_SET,
//     // [OptionCategories.PUNCTUATION.value]: ModeActions.PUNCTUATION_SET,
//     // [OptionCategories.NUMBERS.value]: ModeActions.NUMBERS_SET,
//     // [OptionCategories.WORDS_SOURCE.value]: ModeActions.WORDS_SOURCE_SET,
//     // [OptionCategories.QUOTES_SOURCE.value]: ModeActions.QUOTES_SOURCE_SET,
//     // [OptionCategories.PRACTICE_SOURCE.value]: ModeActions.PRACTICE_SOURCE_SET,
//     // [OptionCategories.FORCE_CORRECTIONS.value]: ModeActions.FORCE_CORRECTIONS_SET,
//     // [OptionCategories.PRACTICE_FORMAT.value]: ModeActions.PRACTICE_FORMAT_SET
//     [OptionCategories.COUNT.value]: "count-set",
//     [OptionCategories.DURATION.value]: "duration-set",
//     [OptionCategories.LENGTH.value]: "quotes_length-set",
//     [OptionCategories.PUNCTUATION.value]: "punctuation-set",
//     [OptionCategories.NUMBERS.value]: "numbers-set",
//     [OptionCategories.WORDS_SOURCE.value]: "words_source-set",
//     [OptionCategories.QUOTES_SOURCE.value]: "quotes_source-set",
//     [OptionCategories.PRACTICE_SOURCE.value]: "practice_source-set",
//     [OptionCategories.FORCE_CORRECTIONS.value]: "force_corrections-set",
//     [OptionCategories.PRACTICE_FORMAT.value]: "practice_format-set"
// } as const;