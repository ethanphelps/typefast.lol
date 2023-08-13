export const TypingModes = {
    COUNT: 'count',
    TIME: 'timed',
    QUOTE: 'quote',
    PRACTICE: 'practice'
} as const;
export type ObjectValues<T> = T[keyof T];
export type TypingMode = ObjectValues<typeof TypingModes>;