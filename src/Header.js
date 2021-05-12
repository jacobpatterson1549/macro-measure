import React from 'react';

import './Header.css';

// props:
// groupName: the name of the current group
// setView(view): sets the main view of the app

const headerItem = (setView, name, title, view) => (
    <button onClick={() => setView(view)} title={title}>
        <span>{name}</span>
    </button>
);

export const Header = (props) => (
    <header className="Header">
        {headerItem(props.setView, props.groupName, 'groups list', 'groups')}
        {headerItem(props.setView, 'ⓘ', 'about page', 'about')}
        {headerItem(props.setView, '?', 'help page', 'help')}
        {headerItem(props.setView, '⚙', 'edit settings', 'settings')}
    </header>
);