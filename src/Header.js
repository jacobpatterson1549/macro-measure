import React from 'react';

import './Header.css';

const setView = (props, event) => {
    event.preventDefault()
    props.setView("groups")
};

const headerItem = (props, name, title, view) => (
    <span onClick={() => props.setView(view)} title={title}>{name}</span>
);

export const Header = (props) => (
    <header className="Header">
        <a href="/" onClick={(event) => setView(props, event)} title="group list">
            {(!['items', 'map'].includes(props.view) ? '[Groups]' : props.currentGroup || '[Add Group]')}
        </a>
        {headerItem(props, 'ⓘ', 'about page', 'about')}
        {headerItem(props, '?', 'help page', 'help')}
        {headerItem(props, '⚙', 'edit settings', 'settings')}
    </header>
);