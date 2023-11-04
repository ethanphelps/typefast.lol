import React, { useEffect, useState } from "react";
import { TypingMode, TypingModes } from "../models/models";
import * as Logger from "../utils/logger";


const WordsCounter = ({ currentWord, totalWords }: { currentWord: number, totalWords: number }): React.ReactElement => {
    return (
        <div className="progress-indicator">{currentWord} / {totalWords}</div>
    )
}

const Timer = ({ duration }: { duration: number }): React.ReactElement => {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(duration);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (remainingSeconds > 0) {
                setRemainingSeconds(remainingSeconds - 1);
            } else  {
                clearInterval(interval);
                setRemainingSeconds(0);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [remainingSeconds]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    let displaySeconds = JSON.stringify(seconds);
    if (displaySeconds.length < 2) {
        displaySeconds = "0" + displaySeconds;
    }
    Logger.debug(`${minutes}:${displaySeconds}`);

    return (
        <div className="progress-indicator">{minutes}:{displaySeconds}</div>
    )
}

interface ProgressIndicatorProps {
    mode: TypingMode;
    currentWord: number;
    totalWords: number;
    duration: number;
}
export const ProgressIndicator = ({ mode, currentWord, totalWords, duration }: ProgressIndicatorProps): React.ReactElement => {
    const fixedModes = new Set<TypingMode>([TypingModes.FIXED, TypingModes.QUOTES, TypingModes.PRACTICE]);
    return (
        <header id="progress-indicator-container">
            {
                fixedModes.has(mode) ? 
                    <WordsCounter currentWord={currentWord} totalWords={totalWords}/>
                    : <></>
            }
            {
                mode == TypingModes.TIMED ? 
                    <Timer duration={duration}/>
                    : <></>
            }
        </header>
    )
}