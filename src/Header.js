import React from 'react';

import './Header.css';

// props:
// groups: the current page being viewed
// groups: the groups with name properties
// currentGroupIndex: the current viewed group
// setView(view): sets the main view of the app

const groupName = (view, groups, currentGroupIndex) => (
    /^item(s|(-\w+))$/.test(view)
        ? groups[currentGroupIndex].name
        : '[Groups]'
);

const headerItem = (setView, name, title, view) => (
    <button onClick={() => setView(view)} title={title}>
        <span>{name}</span>
    </button>
);

export const Header = (props) => (
    <header className="Header">
        {headerItem(props.setView, groupName(props.view, props.groups, props.currentGroupIndex), 'groups list', 'groups')}
        {headerItem(props.setView, 'ⓘ', 'about page', 'about')}
        {headerItem(props.setView, '?', 'help page', 'help')}
        {headerItem(props.setView, '⚙', 'edit settings', 'settings')}
    </header>
);