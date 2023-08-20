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
    FORCE_CORRECTIONS: 'force-corrections',
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

type OptionDisplayValues = FixedWordExerciseLength | TimedExerciseDuration | QuotesExerciseLength | PunctuationOption | NumberOption;
export const OptionValues: Record<OptionCategory, OptionDisplayValues[]> = {
    [OptionCategories.COUNT]: Object.values(FixedWordExerciseLengths),
    [OptionCategories.DURATION]: Object.values(TimedExerciseDurations),
    [OptionCategories.LENGTH]: Object.values(QuotesExerciseLengths),
    [OptionCategories.PUNCTUATION]: Object.values(PunctuationOptions),
    [OptionCategories.NUMBERS]: Object.values(NumberOptions),
    [OptionCategories.WORDS_SOURCE]: [true, false],
    [OptionCategories.QUOTES_SOURCE]: ['english-basic', 'english-common', 'english-advanced'],
    [OptionCategories.FORCE_CORRECTIONS]: [true, false],
};