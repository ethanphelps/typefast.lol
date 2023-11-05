import React, { ReactNode, useState } from "react";

export const Tooltip = ({ text, children }: { text: string, children: ReactNode }): React.ReactElement => {
    const [visible, setVisible] = useState(false);
    const [cssClass, setCssClass] = useState("tooltip");

    const handleMouseEnter = (e: React.MouseEvent) => {
        setVisible(true);
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        setTimeout(() => {
            setVisible(false);
            setCssClass("tooltip");
        }, 150);
        setCssClass("tooltip hide");
    }

    return (
        <div 
            className="tooltip-container" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {
                visible ?
                    <div className={cssClass}>{text}</div>
                    : <></>
            } 
        </div>
    )
}