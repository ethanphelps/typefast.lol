import React, { MouseEventHandler } from "react";

interface IconButtonProps {
    image: React.ReactElement;
    path?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>
}
export const IconButton = ({
    image,
    path,
    onClick
}: IconButtonProps): React.ReactElement => {
    return (
        <a className="icon-button" href={path} onClick={onClick}>
            {image}
        </a>
    );
};