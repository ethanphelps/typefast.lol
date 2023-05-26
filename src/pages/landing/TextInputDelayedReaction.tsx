import React, { ChangeEvent, FormEvent } from "react";

  /**
   * calls setTimeout with a delay and also clears the previous timeout to avoid
   * duplicate callback calls for one set of changes. Every time a character is
   * entered or deleted, the timer until callback gets called is reset. Once no
   * characters have been typed for delay ms, then callback is called
   * 
   * usage: <TextInputDelayedReaction delay={500} callback={console.log} />
   */
  const TextInputDelayedReaction = ({
    delay,
    callback,
  }: {
    delay: number;
    callback: (e: string) => void;
  }): React.ReactElement => {

    let timeoutId = 0;
    const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback(e.target.value);
      }, delay);
    };

    return (
      <div className="input-container">
        <input
          onInput={handleInput}
          type="text"
          id="delayed-text"
          name="delayed-text"
        />
      </div>
    );
  };