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
    COUNT: 'count',
    DURATION: 'duration',
    LENGTH: 'length',
    PUNCTUATION: 'punctuation',
    NUMBERS: 'numbers',
    WORDS_SOURCE: 'source',
    QUOTES_SOURCE: 'source',
    PRACTICE_SOURCE: 'source',
    FORCE_CORRECTIONS: 'force corrections',
    PRACTICE_FORMAT: 'format'
} as const;
export type OptionCategory = ObjectValues<typeof OptionCategories>;

export const FixedWordExerciseLengths = {
    SHORT: 10,
    MEDIUM: 25,
    LONG: 50,
    EXTRA_LONG: 100,
    SUPER_LONG: 250,
} as const;
export type FixedWordExerciseLength = ObjectValues<typeof FixedWordExerciseLengths>;

export const TimedExerciseDurations = {
    SHORT: '10s',
    MEDIUM: '30s',
    LONG: '60s',
    EXTRA_LONG: '2m',
    SUPER_LONG: '5m',
} as const;
export type TimedExerciseDuration = ObjectValues<typeof TimedExerciseDurations>;

export const QuotesExerciseLengths = {
    SHORT: 'S',
    MEDIUM: 'M',
    LONG: 'L',
    EXTRA_LONG: 'XL',
} as const;
export type QuotesExerciseLength = ObjectValues<typeof QuotesExerciseLengths>;

export const PunctuationOptions = {
    ON: 'on',
    OFF: 'off'
} as const;
export type PunctuationOption = ObjectValues<typeof PunctuationOptions>;

export const NumberOptions = {
    ON: 'on',
    OFF: 'off'
} as const;
export type NumberOption = ObjectValues<typeof NumberOptions>;

export const ForceCorrectionsOptions = {
    ON: 'on',
    OFF: 'off'
} as const;
export type ForceCorrectionOption = ObjectValues<typeof ForceCorrectionsOptions>;

export const WordsSourceLabels = {
    BASIC: 'basic',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    DIFFICULT_WORDS: 'my difficult words',
} as const;
export type WordSourceLabel = ObjectValues<typeof WordsSourceLabels>;

export const QuotesSourceLabels = {
    BOOKS: 'books',
    POEMS: 'poems',
    SONGS: 'songs',
    ALL: 'all'
} as const;
export type QuotesSourceLabel = ObjectValues<typeof QuotesSourceLabels>;

export const PracticeFormats = {
    RANDOM: 'random',
    REPETITION: 'repetition',
} as const;
export type PracticeFormat = ObjectValues<typeof PracticeFormats>;

export const PracticeSourceLabels = {
    DIFFICULT_WORDS: 'difficult words',
    MOST_MISSED: 'most missed',
    CUSTOM: 'custom'
} as const;
export type PracticeSourceLabel = ObjectValues<typeof PracticeSourceLabels>;

export type OptionDisplayValues = FixedWordExerciseLength | TimedExerciseDuration | QuotesExerciseLength | PunctuationOption | NumberOption | WordSourceLabel | QuotesSourceLabel | ForceCorrectionOption | PracticeFormat | PracticeSourceLabel;
export const OptionValues: Record<OptionCategory, OptionDisplayValues[]> = {
    [OptionCategories.COUNT]: Object.values(FixedWordExerciseLengths),
    [OptionCategories.DURATION]: Object.values(TimedExerciseDurations),
    [OptionCategories.LENGTH]: Object.values(QuotesExerciseLengths),
    [OptionCategories.PUNCTUATION]: Object.values(PunctuationOptions),
    [OptionCategories.NUMBERS]: Object.values(NumberOptions),
    [OptionCategories.WORDS_SOURCE]: Object.values(WordsSourceLabels),
    [OptionCategories.QUOTES_SOURCE]: Object.values(QuotesSourceLabels),
    [OptionCategories.PRACTICE_SOURCE]: Object.values(PracticeSourceLabels),
    [OptionCategories.FORCE_CORRECTIONS]: Object.values(ForceCorrectionsOptions),
    [OptionCategories.PRACTICE_FORMAT]: Object.values(PracticeFormats)
};

export const ModeOptions: Record<TypingMode, OptionCategory[]> = {
    [TypingModes.FIXED]: [OptionCategories.COUNT, OptionCategories.PUNCTUATION, OptionCategories.NUMBERS, OptionCategories.WORDS_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.TIMED]: [OptionCategories.DURATION, OptionCategories.PUNCTUATION, OptionCategories.NUMBERS, OptionCategories.WORDS_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.QUOTES]: [OptionCategories.LENGTH, OptionCategories.QUOTES_SOURCE, OptionCategories.FORCE_CORRECTIONS],
    [TypingModes.FREEFORM]: [],
    [TypingModes.PRACTICE]: [OptionCategories.PRACTICE_FORMAT, OptionCategories.PRACTICE_SOURCE],
};