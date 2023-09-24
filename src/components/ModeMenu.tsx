import React, { useEffect, useReducer, useState } from 'react';
import '../pages/landing/landing.scss';
import { ModeOptions, OptionCategories, OptionCategory, OptionCategoryDisplay, OptionCategoryValue, OptionItemConfiguration, OptionItemValue, OptionValuesByCategory, StatePropertiesByCategory, TypingMode, TypingModes } from '../models/models';
import { ModeActions, ModeState, ModeDispatchInput, ModeActionsByCategory } from '../reducers/mode-reducer';
import ModeSelectInput from './ModeSelectInput';
import { ExerciseDispatchInput, ExerciseState, TypingActions } from '../reducers/exercise-reducer';


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

type ModeInputComponent = typeof ModeRadioInput | typeof ModeSelectInput;
export const OptionCategoryToInputComponent: Record<OptionCategoryValue, ModeInputComponent> = {
    [OptionCategories.COUNT.value]: ModeRadioInput,
    [OptionCategories.DURATION.value]: ModeRadioInput,
    [OptionCategories.LENGTH.value]: ModeRadioInput,
    [OptionCategories.PUNCTUATION.value]: ModeRadioInput,
    [OptionCategories.NUMBERS.value]: ModeRadioInput,
    [OptionCategories.WORDS_SOURCE.value]: ModeSelectInput,
    [OptionCategories.QUOTES_SOURCE.value]: ModeSelectInput,
    [OptionCategories.PRACTICE_SOURCE.value]: ModeRadioInput,
    [OptionCategories.FORCE_CORRECTIONS.value]: ModeRadioInput,
    [OptionCategories.PRACTICE_FORMAT.value]: ModeRadioInput
} as const


// TODO: conditionaly display horizontal selector or select based on config
export interface ModeOptionRowProps {
    category: OptionCategory;
    optionItems: OptionItemConfiguration[];
    state: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>;
    dispatchNewWords: () => void;
}

/**
 * Each option category is mapped to a specific input component which is chosen at runtime
 */
const ModeOptionRow = ({ category, optionItems, state, dispatch, dispatchNewWords }: ModeOptionRowProps): React.ReactElement => {
    const DynamicInputComponent = OptionCategoryToInputComponent[category.value];
    return (
        <div className="mode-option-row">
            <div className="mode-option-label">{category.display}:</div>
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
 * Mini menu for selecting options specific to a mode
 * TODO: track state for selected options and transmit to TypingArea
 */
interface ModeMenuProps {
    state: ModeState;
    dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>;
    dispatchNewWords: () => void
}
export const ModeMenu = ({ state, dispatch, dispatchNewWords }: ModeMenuProps): React.ReactElement => {
    // TODO: could also just create this function inside Landing and pass it in as props. May run into issues of state being out of sync?
    return (
        <div className="mode-menu-container">
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
                                key={index}
                            />
                        );
                    })
                }
            </section>
        </div>
    );
};
