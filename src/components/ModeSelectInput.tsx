import React, { useEffect, useRef, useState } from 'react';
import { ModeOptionRowProps } from './ModeMenu';
import { OptionCategoryValue, OptionItemConfiguration, OptionItemDisplay, OptionItemValue, StatePropertiesByCategory } from '../models/models';
import { ModeActionsByCategory, ModeDispatchInput, ModeState } from '../reducers/mode-reducer';



const ModeSelectInput = ({ category, optionItems, state, dispatch }: ModeOptionRowProps): React.ReactElement => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<OptionItemDisplay | null>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    const toggleDropdown = () => {
        console.log('select clicked!!!', isOpen);
        setIsOpen(!isOpen);
    };

    const handleSelectOptionClicked = (option: OptionItemConfiguration, dispatch: React.Dispatch<React.ReducerAction<React.Reducer<ModeState, ModeDispatchInput>>>) => {
        setSelectedOption(option.display);
        setIsOpen(false);
        dispatch({
                type: ModeActionsByCategory[category.value],
                payload: {
                    [StatePropertiesByCategory[category.value]]: option.value
                }
        });
    }

    const selectToggleClass = isOpen ? 'open' : 'closed';
    const optionsClass = `select-options ${selectToggleClass}`;
    const displayClass = `select-display ` + selectToggleClass;

    return (
        <div className="custom-select" ref={selectRef}>
            <div className={displayClass} onClick={toggleDropdown}>
                {/* {selectedOption ? selectedOption : 'Select an option'} */}
                { state[StatePropertiesByCategory[category.value]]}
            </div>
            <ul className={optionsClass}>
                {optionItems.map((optionItem: OptionItemConfiguration, index: number) => (
                    <li key={index} onClick={() => handleSelectOptionClicked(optionItem, dispatch)}>
                        {optionItem.display}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ModeSelectInput;