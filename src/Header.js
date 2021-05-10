import React from 'react';

import './Header.css';

// props:
// currentGroupName: the name of the current group
// setView(view): sets the main view of the app
// view: the name of the current main view

const groupName = (props) => (
    /^item(s|(-\w+))$/.test(props.view) ? props.currentGroupName : '[Groups]'
);

const groupsOnClick = (props, event) => {
    event.preventDefault()
    props.setView("groups")
};

const headerItem = (props, name, title, view) => (
    <span onClick={() => props.setView(view)} title={title}>{name}</span>
);

export const Header = (props) => (
    <header className="Header">
        <a href="/" onClick={(event) => groupsOnClick(props, event)} title="groups list">
            {groupName(props)}
        </a>
        {headerItem(props, 'ⓘ', 'about page', 'about')}
        {headerItem(props, '?', 'help page', 'help')}
        {headerItem(props, '⚙', 'edit settings', 'settings')}
    </header>
);