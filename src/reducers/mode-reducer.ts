import { 
    FixedWordExerciseLengthValue, 
    FixedWordExerciseLengths, 
    ObjectValues, 
    OptionCategories, 
    OptionCategoryValue, 
    PracticeFormatValue, 
    PracticeFormats, 
    PracticeSourceLabelValue, 
    PracticeSourceLabels, 
    QuotesExerciseLengthValue, 
    QuotesExerciseLengths, 
    QuotesSourceLabelValue, 
    QuotesSourceLabels, 
    TimedExerciseDurationValue, 
    TimedExerciseDurations, 
    TypingMode, 
    TypingModes, 
    WordsSourceLabelValue 
} from "../models/models";
import { WordsSources } from "../services/words/words.interface";

export const ModeActions = {
    RESET: 'reset',
    MODE_SET: 'mode-set',
    WORD_COUNT_SET: 'count-set',
    DURATION_SET: 'duration-set',
    QUOTES_LENGTH_SET: 'quotes_length-set',
    PUNCTUATION_SET: 'punctuation-set',
    SYMBOLS_SET: 'symbols-set',
    PARENTHESES_SET: 'parentheses-set',
    NUMBERS_SET: 'numbers-set',
    WORDS_SOURCE_SET: 'words_source-set',
    QUOTES_SOURCE_SET: 'quotes_source-set',
    PRACTICE_SOURCE_SET: 'practice_source-set',
    FORCE_CORRECTIONS_SET: 'force_corrections-set',
    PRACTICE_FORMAT_SET: 'practice_format-set',
    LOAD_FROM_SESSION_STORAGE: 'load-from-session-storage',
    QUOTE_SET: 'quote-set'
} as const;
export type ModeAction = ObjectValues<typeof ModeActions>;

interface ActionPayload {
}
export interface ModeDispatchInput {
    type: ModeAction;
    payload?: Partial<ModeState> & Partial<ActionPayload>;
}

// DON'T USE THIS
export const ModeStateProperties = {
    MODE: 'mode',
    WORD_COUNT: 'wordCount',
    DURATION: 'duration',
    QUOTES_LENGTH: 'quotesLength',
    PUNCTUATION: 'punctuation',
    NUMBERS: 'numbers',
    WORDS_SOURCE: 'wordsSource', // todo: reconcile words source state values and words source values into a single source of truth
    QUOTES_SOURCE: 'quotesSource', // todo: figure out how to combine quote length and source states to get the right quotes
    PRACTICE_SOURCE: 'practiceSource',
    FORCE_CORRECTIONS: 'forceCorrections',
    PRACTICE_FORMAT: 'practiceFormat',
} as const;
export type ModeStateProperty = ObjectValues<typeof ModeStateProperties>;
/**
 * should mode state store the option configuration? or just the option value?
 * probably just the value since the display value shouldn't be needed for tracking state
 * TODO: figure out WHY using ModeStateProperties gives a runtime type error: Uncaught TypeError: Cannot read properties of undefined (reading FIXED) on line 90
 */
export interface ModeState {
    // [ModeStateProperties.MODE]: TypingMode;
    // [ModeStateProperties.WORD_COUNT]: FixedWordExerciseLengthValue;
    // [ModeStateProperties.DURATION]: TimedExerciseDurationValue;
    // [ModeStateProperties.QUOTES_LENGTH]: QuotesExerciseLengthValue;
    // [ModeStateProperties.PUNCTUATION]: boolean;
    // [ModeStateProperties.NUMBERS]: boolean;
    // [ModeStateProperties.WORDS_SOURCE]: WordsSourceLabelValue; // todo: reconcile words source state values and words source values into a single source of truth
    // [ModeStateProperties.QUOTES_SOURCE]: QuotesSourceLabelValue; // todo: figure out how to combine quote length and source states to get the right quotes
    // [ModeStateProperties.PRACTICE_SOURCE]: PracticeSourceLabelValue;
    // [ModeStateProperties.FORCE_CORRECTIONS]: boolean;
    // [ModeStateProperties.PRACTICE_FORMAT]: PracticeFormatValue;
    mode: TypingMode;
    modePriorToPractice: TypingMode;
    wordCount: FixedWordExerciseLengthValue;
    duration: TimedExerciseDurationValue;
    quotesLength: QuotesExerciseLengthValue;
    punctuation: boolean;
    symbols: boolean;
    parentheses: boolean;
    numbers: boolean;
    wordsSource: WordsSourceLabelValue; // todo: reconcile words source state values and words source values into a single source of truth
    quotesSource: QuotesSourceLabelValue; // todo: figure out how to combine quote length and source states to get the right quotes
    practiceSource: PracticeSourceLabelValue;
    forceCorrections: boolean;
    practiceFormat: PracticeFormatValue;
}

export const MODE_STATE = 'MODE_STATE';

export const initialModeState: ModeState = {
    mode: TypingModes.FIXED,
    modePriorToPractice: TypingModes.FIXED,
    wordCount: FixedWordExerciseLengths.MEDIUM.value,
    duration: TimedExerciseDurations.MEDIUM.value,
    quotesLength: QuotesExerciseLengths.MEDIUM.value,
    punctuation: false,
    symbols: false,
    parentheses: false,
    numbers: false,
    wordsSource: WordsSources.ENGLISH_BASIC,
    quotesSource: QuotesSourceLabels.ALL.value,
    practiceSource: PracticeSourceLabels.DIFFICULT_WORDS.value,
    forceCorrections: false,
    practiceFormat: PracticeFormats.REPETITION.value,
}


export const modeOptionsReducer = (state: ModeState, action: ModeDispatchInput): ModeState => {
    console.debug(`Action: ${action.type}. Payload: ${JSON.stringify(action.payload)}`);
    setStorage({ ...state, ...action.payload }, action.type);
    switch (action.type) {
        // When Mode is set, need to default options that aren't already set or are set with invalid options
        case (ModeActions.MODE_SET): {
            console.debug(`Mode set to: ${action.payload.mode}!`);
            const nextMode = action.payload.mode;
            let modePriorToPractice = state.modePriorToPractice;
            if(nextMode !== TypingModes.PRACTICE) {
                modePriorToPractice = nextMode;
            } else if(nextMode === TypingModes.PRACTICE && state.mode !== TypingModes.PRACTICE) {
                modePriorToPractice = state.mode;
            }
            return {
                ...state,
                mode: nextMode,
                modePriorToPractice: modePriorToPractice
            }
        }
        case (ModeActions.WORD_COUNT_SET):
            return {
                ...state,
                wordCount: action.payload.wordCount
            }
        case (ModeActions.DURATION_SET):
            return {
                ...state,
                duration: action.payload.duration
            }
        case (ModeActions.QUOTES_LENGTH_SET):
            return {
                ...state,
                quotesLength: action.payload.quotesLength
            }
        case (ModeActions.PUNCTUATION_SET):
            return {
                ...state,
                punctuation: action.payload.punctuation
            }
        case (ModeActions.SYMBOLS_SET):
            return {
                ...state,
                symbols: action.payload.symbols
            }
        case (ModeActions.PARENTHESES_SET):
            return {
                ...state,
                parentheses: action.payload.parentheses
            }
        case (ModeActions.NUMBERS_SET):
            return {
                ...state,
                numbers: action.payload.numbers
            }
        case (ModeActions.WORDS_SOURCE_SET):
            return {
                ...state,
                wordsSource: action.payload.wordsSource
            }
        case (ModeActions.QUOTES_SOURCE_SET):
            return {
                ...state,
                quotesSource: action.payload.quotesSource
            }
        case (ModeActions.PRACTICE_SOURCE_SET):
            return {
                ...state,
                practiceSource: action.payload.practiceSource
            }
        case (ModeActions.FORCE_CORRECTIONS_SET):
            return {
                ...state,
                forceCorrections: action.payload.forceCorrections
            }
        case (ModeActions.PRACTICE_FORMAT_SET):
            return {
                ...state,
                practiceFormat: action.payload.practiceFormat
            }
        default:
            return state;
    }
}



// using ModeActions const object here does NOT cause the runtime undefined error??
export const ModeActionsByCategory: Record<OptionCategoryValue, ModeAction> = {
    [OptionCategories.MODE.value]: ModeActions.MODE_SET,
    [OptionCategories.COUNT.value]: ModeActions.WORD_COUNT_SET,
    [OptionCategories.DURATION.value]: ModeActions.DURATION_SET,
    [OptionCategories.LENGTH.value]: ModeActions.QUOTES_LENGTH_SET,
    [OptionCategories.PUNCTUATION.value]: ModeActions.PUNCTUATION_SET,
    [OptionCategories.SYMBOLS.value]: ModeActions.SYMBOLS_SET,
    [OptionCategories.PARENTHESES.value]: ModeActions.PARENTHESES_SET,
    [OptionCategories.NUMBERS.value]: ModeActions.NUMBERS_SET,
    [OptionCategories.WORDS_SOURCE.value]: ModeActions.WORDS_SOURCE_SET,
    [OptionCategories.QUOTES_SOURCE.value]: ModeActions.QUOTES_SOURCE_SET,
    [OptionCategories.PRACTICE_SOURCE.value]: ModeActions.PRACTICE_SOURCE_SET,
    [OptionCategories.FORCE_CORRECTIONS.value]: ModeActions.FORCE_CORRECTIONS_SET,
    [OptionCategories.PRACTICE_FORMAT.value]: ModeActions.PRACTICE_FORMAT_SET
    // [OptionCategories.COUNT.value]: "count-set",
    // [OptionCategories.DURATION.value]: "duration-set",
    // [OptionCategories.LENGTH.value]: "quotes_length-set",
    // [OptionCategories.PUNCTUATION.value]: "punctuation-set",
    // [OptionCategories.NUMBERS.value]: "numbers-set",
    // [OptionCategories.WORDS_SOURCE.value]: "words_source-set",
    // [OptionCategories.QUOTES_SOURCE.value]: "quotes_source-set",
    // [OptionCategories.PRACTICE_SOURCE.value]: "practice_source-set",
    // [OptionCategories.FORCE_CORRECTIONS.value]: "force_corrections-set",
    // [OptionCategories.PRACTICE_FORMAT.value]: "practice_format-set"
} as const;


const setStorage = (state: ModeState, action: ModeAction): void => {
    if(action !== ModeActions.LOAD_FROM_SESSION_STORAGE) {
        sessionStorage.setItem(MODE_STATE, JSON.stringify(state));
    }
}