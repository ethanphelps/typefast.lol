import React, { useEffect, useReducer, useRef, useState } from 'react';
import '../pages/landing/landing.scss';
import { DurationModeToDurationCategory, DurationModes, ModeOptions, OptionCategories, OptionCategory, OptionCategoryDisplay, OptionCategoryValue, OptionItemConfiguration, OptionItemValue, OptionValuesByCategory, RandomTextModes, StatePropertiesByCategory, ToggleCategories, ToggleCategory, ToggleCategoryToLabel, TypingMode, TypingModeOptions, TypingModeToSourceCategory, TypingModes } from '../models/models';
import { ModeActions, ModeState, ModeDispatchInput, ModeActionsByCategory } from '../reducers/mode-reducer';
import ModeSelectInput from './ModeSelectInput';
import { IconButton } from './IconButton';
import { ChevronDown, ChevronUp } from '../inline-svgs';


interface ModeRowProps {
    modeName: TypingMode;
    currentMode: TypingMode;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>
    dispatchNewWords: () => void;
}
const ModeRow = ({ modeName, currentMode, dispatch, dispatchNewWords }: ModeRowProps): React.ReactElement => {
    const cssClass = modeName === currentMode ? 'mode-item selected' : 'mode-item';
    return (
        <header
            className={cssClass}
            onClick={() => {
                dispatch({ type: ModeActions.MODE_SET, payload: { mode: modeName } });
                // dispatchNewWords();
            }}
        >
            <span>{modeName}</span>
        </header>
    );
};


const ModeOption = (
    { item, selectedItem, category, state, dispatch, dispatchNewWords }:
        {
            item: OptionItemConfiguration;
            selectedItem: OptionItemValue; // may need to change this to OptionItemConfiguration and change ModeState to track configurations instead of just values..
            category: OptionCategory;
            state: ModeState;
            dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>
            dispatchNewWords: () => void;
        }
): React.ReactElement => {
    const cssClass = item.value === selectedItem ? 'mode-item selected' : 'mode-item';
    return (
        <div
            className={cssClass}
            onClick={() => {
                dispatch({
                    type: ModeActionsByCategory[category.value],
                    payload: {
                        [StatePropertiesByCategory[category.value]]: item.value     // need to map current category to a category dispatch. pass selected item via payload
                    }
                });
                // dispatchNewWords();
            }} 
        >
            {item.display}
        </div>
    )
}


const getModeOptionStateByCategory = (state: ModeState, category: OptionCategoryValue): Exclude<OptionItemValue, TypingMode> => {
    return state[StatePropertiesByCategory[category]] as Exclude<OptionItemValue, TypingMode>;
}

export const ModeRadioInput = ({ category, optionItems, state, dispatch, dispatchNewWords }: ModeOptionRowProps): React.ReactElement => {
    return (
        <div className="mode-option-value-list">
            {
                optionItems.map((optionItem: OptionItemConfiguration, index: number) => {
                    return (
                        <ModeOption
                            item={optionItem}
                            selectedItem={getModeOptionStateByCategory(state, category.value)} // map current category to a state value for current selected item from that category
                            category={category}
                            state={state}
                            dispatch={dispatch}
                            dispatchNewWords={dispatchNewWords}
                            key={index}
                        />
                    )
                })
            }
        </div>
    )
}

// MAY NOT NEED THIS: could just have separate state properties for symbols/punctuation/parentheses/etc. and not use horizontal dividers
const ModeMultiRadioInput = ({ category, optionItems, state, dispatch, dispatchNewWords}: ModeOptionRowProps): React.ReactElement => {
    return (
        <div className="multi-radio-input">
            
        </div>
    )
}

type ModeInputComponent = typeof ModeRadioInput | typeof ModeSelectInput;
export const OptionCategoryToInputComponent: Record<OptionCategoryValue, ModeInputComponent> = {
    [OptionCategories.MODE.value]: ModeSelectInput,
    [OptionCategories.COUNT.value]: ModeRadioInput,
    [OptionCategories.DURATION.value]: ModeRadioInput,
    [OptionCategories.LENGTH.value]: ModeRadioInput,
    [OptionCategories.PUNCTUATION.value]: ModeRadioInput,
    [OptionCategories.SYMBOLS.value]: ModeRadioInput,
    [OptionCategories.PARENTHESES.value]: ModeRadioInput,
    [OptionCategories.NUMBERS.value]: ModeRadioInput,
    [OptionCategories.WORDS_SOURCE.value]: ModeSelectInput,
    [OptionCategories.QUOTES_SOURCE.value]: ModeSelectInput,
    [OptionCategories.PRACTICE_SOURCE.value]: ModeRadioInput,
    [OptionCategories.FORCE_CORRECTIONS.value]: ModeRadioInput,
    [OptionCategories.PRACTICE_FORMAT.value]: ModeRadioInput
} as const


export interface ModeOptionRowProps {
    category: OptionCategory;
    optionItems: OptionItemConfiguration[];
    state: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>;
    dispatchNewWords: () => void; // TODO: remove
    showTitle?: boolean;
}

/**
 * Each option category is mapped to a specific input component which is chosen at runtime
 */
const ModeOptionRow = ({ category, optionItems, state, dispatch, dispatchNewWords, showTitle }: ModeOptionRowProps): React.ReactElement => {
    const DynamicInputComponent = OptionCategoryToInputComponent[category.value];
    return (
        <div className="mode-option-row">
            {
                showTitle ? 
                <div className="mode-option-label">{category.display}:</div>
                : <></>
            }
            <DynamicInputComponent 
                category={category}
                optionItems={optionItems}
                state={state}
                dispatch={dispatch}
                dispatchNewWords={dispatchNewWords}
            />
        </div>
    );
};


/**
 * Concise toggle input for mode options that are on/off
 */
interface ModeOptionToggleProps {
    category: ToggleCategory,
    state: ModeState,
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>;
}
const ModeOptionToggle = ({ category, state, dispatch }: ModeOptionToggleProps): React.ReactElement => {
    const selected = state[StatePropertiesByCategory[category.value]] ? "selected" : "";
    const cssClass = "mode-item " + selected;
    const handleClick = (event: React.MouseEvent) => {
        dispatch({
            type: ModeActionsByCategory[category.value],
            payload: {
                [category.value]: !state[StatePropertiesByCategory[category.value]]
            }
        })
    }
    return (
        <div className={cssClass} onClick={handleClick}>
            {ToggleCategoryToLabel[category.value]}
        </div>
    );
}


/**
 * collapsed version of mode menu
 */
const ModeMenuCollapsed = ({ state, dispatch, dispatchNewWords, setExpanded }: ModeMenuProps): React.ReactElement => {
    return (
        <section id="collapsed-mode-menu-container" className="typefast-card">
            <div className="collapsed-menu-select-container" id="mode-select">
                <ModeSelectInput
                    category={OptionCategories.MODE}
                    optionItems={OptionValuesByCategory[OptionCategories.MODE.value]}
                    state={state}
                    dispatch={dispatch}
                    dispatchNewWords={() => {}}
                />
            </div>
            <div className="vertical-divider"></div>
            {
                DurationModes.includes(state.mode) ?
                    <>
                        <ModeOptionRow 
                            category={DurationModeToDurationCategory[state.mode]} // map mode to duration/count/length/nothing
                            optionItems={OptionValuesByCategory[DurationModeToDurationCategory[state.mode].value]}
                            state={state}
                            dispatch={dispatch}
                            dispatchNewWords={() => {}}
                        />
                        <div className="vertical-divider"></div>
                    </>
                    : <></>
            }
            {
                RandomTextModes.includes(state.mode) ?
                    <>
                        {
                            ToggleCategories.map((category: ToggleCategory, index: number) => 
                                <ModeOptionToggle 
                                    category={category}
                                    state={state}
                                    dispatch={dispatch}
                                    key={index}
                                />
                            )
                        }
                        <div className="vertical-divider"></div>
                    </>
                    : <></>
            }
            {
                TypingModeToSourceCategory[state.mode] ? 
                    <div className="collapsed-menu-select-container" id="source-select">
                        <ModeSelectInput 
                            category={TypingModeToSourceCategory[state.mode]} 
                            optionItems={OptionValuesByCategory[TypingModeToSourceCategory[state.mode].value]}
                            state={state}
                            dispatch={dispatch}
                            dispatchNewWords={() => {}}
                        />
                    </div>
                    : <></>
            }
            <div id="chevron-up">
                <IconButton image={<ChevronUp />} onClick={() => setExpanded(true)}/>
            </div>
            {}
        </section>
    )
}

const ModeMenuExpanded = ({ state, dispatch, dispatchNewWords, setExpanded }: ModeMenuProps): React.ReactElement => {
        const menuRef = useRef<HTMLDivElement>(null);

        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setExpanded(false);
            }
        };
        useEffect(() => {
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            }, 0)
            return () => {
                window.removeEventListener('click', handleOutsideClick);
            };
        }, []);

        return (
            <div className="mode-menu-container" ref={menuRef}>
                <section id="mode-selector">
                    <header id="mode-header">mode</header>
                    <section id="mode-list">
                        {
                            Object.values(TypingModes).map((modeName: TypingMode, index: number) => {
                                return (
                                    <ModeRow
                                        modeName={modeName}
                                        currentMode={state.mode}
                                        dispatch={dispatch}
                                        dispatchNewWords={dispatchNewWords}
                                        key={index}
                                    />
                                );
                            })
                        }
                    </section>
                </section>
                <div id="mode-menu-divider"></div>
                <section id="mode-options">
                    {
                        ModeOptions[state.mode].map((category: OptionCategory, index: number) => {
                            return (
                                <ModeOptionRow
                                    category={category}
                                    optionItems={OptionValuesByCategory[category.value]}
                                    state={state}
                                    dispatch={dispatch}
                                    dispatchNewWords={dispatchNewWords}
                                    showTitle={true}
                                    key={index}
                                />
                            );
                        })
                    }
                </section>
                <div id="chevron-down">
                    <IconButton image={<ChevronDown />} onClick={() => {
                        window.removeEventListener('click', handleOutsideClick);
                        setExpanded(false);
                    }} />
                </div>
            </div>
        );
}


/**
 * Mini menu for selecting options specific to a mode
 */
interface ModeMenuProps {
    state: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>;
    dispatchNewWords: () => void
    setExpanded?: React.Dispatch<React.SetStateAction<boolean>>
}
export const ModeMenu = ({ state, dispatch, dispatchNewWords }: ModeMenuProps): React.ReactElement => {
    const [expanded, setExpanded] = useState<boolean>(false);
    if(expanded) {
        return (
            <ModeMenuExpanded 
                state={state}
                dispatch={dispatch}
                dispatchNewWords={dispatchNewWords}
                setExpanded={setExpanded}
            />
        )
    }
    return (
        <ModeMenuCollapsed 
            state={state}
            dispatch={dispatch}
            dispatchNewWords={dispatchNewWords}
            setExpanded={setExpanded}
        />
    );
};
