import React, { useEffect, useState, Suspense } from 'react';
import './landing.scss';
import { Add, Search } from '../../inline-svgs';
import Link from '../../components/Link';
import { Recipe } from '../../models/models';
import { getConfig } from '../../config';
import { suspenseWrapper } from '../../utils/suspenseWrapper';

const config = getConfig();

interface IconButtonProps {
    image: React.ReactElement;
    path?: string;
}
export const IconButton = ({
    image,
    path,
}: IconButtonProps): React.ReactElement => {
    return (
        <a className="icon-button" href={path}>
            {image}
        </a>
    );
};


const Header = ({ }): React.ReactElement => {
    return (
        <header className="header-container">
            <div id="logo">typefast.lol</div>
            {/* <section className="header-buttons">
                <IconButton image={<Search />} />
                <IconButton image={<Add />} path="/new" />
            </section> */}
        </header>
    );
};


export const Landing: React.FC = (): React.ReactElement => {

    useEffect(() => {
    }, []);

    return (
        <div className="landing-container">
            <Header />
        </div>
    );
};
