import React, { useEffect, useState } from 'react';
import '../pages/landing/landing.scss';
import { TypingMode, TypingModes } from '../models/models';

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


// todo: see if words list should be passed into TypingArea component?

/**
 * Mini menu for selecting options specific to a mode
 */
export const ModeMenu: React.FC = (): React.ReactElement => {
    const [mode, setMode] = useState<TypingMode>(TypingModes.FIXED); // TODO: pass this in from Landing

    return (
        <div className="mode-menu-container">
            <div id="mode-selector">
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
            </div>
            <div id="mode-menu-divider"></div>
            <div id="mode-options">hjkl</div>
        </div>
    );
};
