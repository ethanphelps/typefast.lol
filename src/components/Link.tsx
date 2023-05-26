import React from "react" ;

interface LinkProps {
    className?: string;
    href: string;
    children: React.ReactElement;
}

const Link = ({className, href, children}: LinkProps): React.ReactElement => {
    const onClick = (event: React.MouseEvent) => {
        event.preventDefault(); // prevent page reload
        window.history.pushState({}, "", href) // update url
        const navEvent = new PopStateEvent('popstate');
        window.dispatchEvent(navEvent);
    }

    return (
        <a className={className} href={href} onClick={onClick}>
            {children}
        </a>
    );
}

export default Link;