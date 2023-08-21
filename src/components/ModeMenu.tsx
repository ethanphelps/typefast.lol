import React, { useEffect, useState } from 'react';
import '../pages/landing/landing.scss';
import { ModeOptions, OptionCategories, OptionCategory, OptionDisplayValues, OptionValues, TypingMode, TypingModes } from '../models/models';

// const config = getConfig();
// const LENGTH: FixedWordExerciseLength = FixedWordExerciseLengths.MEDIUM;
// const SOURCE: WordsSource = WordsSources.ENGLISH_BASIC;


interface ModeRowProps {
    modeName: TypingMode;
    currentMode: TypingMode;
    setMode: React.Dispatch<React.SetStateAction<TypingMode>>;
}
const ModeRow = ({ modeName, currentMode, setMode: setModeName }: ModeRowProps ): React.ReactElement => {
    const cssClass = modeName === currentMode ? 'mode-item selected' : 'mode-item';
    return (
        <header 
            className={cssClass}
            onClick={() => setModeName(modeName)}
        >
            <span>{modeName}</span>
        </header>
    );
};


interface ModeOptionProps {
    category: OptionCategory;
    values: OptionDisplayValues[];
    // currentMode: TypingMode;
}
const ModeOption = ({ category, values, }: ModeOptionProps): React.ReactElement => {
    return (
        <div className="mode-option-row">
            <div className="mode-option-label">{category}:</div>
            <div className="mode-option-value-list">
                {
                    values.map((value: OptionDisplayValues) => <div className="mode-option-value">{value}</div>)
                }
            </div>
        </div>
    );
};


/**
 * Mini menu for selecting options specific to a mode
 * TODO: track state for selected options and transmit to TypingArea
 */
export const ModeMenu: React.FC = (): React.ReactElement => {
    const [mode, setMode] = useState<TypingMode>(TypingModes.FIXED); // TODO: pass this in from Landing

    return (
        <div className="mode-menu-container">
            <section id="mode-selector">
                <header id="mode-header">mode</header>
                <section id="mode-list">
                    {
                        Object.values(TypingModes).map((modeName: TypingMode) => {
                            return (
                                <ModeRow 
                                    modeName={modeName} 
                                    currentMode={mode} 
                                    setMode={setMode}
                                />
                            );
                        })
                    }
                </section>
            </section>
            <div id="mode-menu-divider"></div>
            <section id="mode-options">
                {/* <ModeOption 
                    category={OptionCategories.COUNT}
                    values={OptionValues[OptionCategories.COUNT]}
                />
                <ModeOption 
                    category={OptionCategories.PUNCTUATION}
                    values={OptionValues[OptionCategories.PUNCTUATION]}
                />
                <ModeOption 
                    category={OptionCategories.NUMBERS}
                    values={OptionValues[OptionCategories.NUMBERS]}
                />
                <ModeOption 
                    category={OptionCategories.WORDS_SOURCE}
                    values={OptionValues[OptionCategories.WORDS_SOURCE]}
                /> */}
                {
                    ModeOptions[mode].map((category: OptionCategory) => {
                        return (
                            <ModeOption 
                                category={category}
                                values={OptionValues[category]}
                            />
                        );
                    })
                }
            </section>
        </div>
    );
};
