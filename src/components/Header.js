import './Header.css';

import { View } from '../utils/View';

export const Header = (props) => (
    <header className="Header">
        {getHeaderItem(props.setView, getGroupName(props.view, props.groups, props.groupIndex), 'groups list', View.Group_Read_List)}
        {getHeaderItem(props.setView, 'ⓘ', 'about page', View.About)}
        {getHeaderItem(props.setView, '?', 'help page', View.Help)}
        {getHeaderItem(props.setView, '⚙', 'edit settings', View.Settings)}
    </header>
);

const getGroupName = (view, groups, groupIndex) => (
    (View.isItem(view) && groups.length)
        ? groups[groupIndex].name
        : '[Groups]'
);

const getHeaderItem = (setView, itemName, itemTitle, itemView) => (
    <button
        className="FakeButton"
        title={itemTitle}
        onClick={handleSetView(setView, itemView)}
    >
        <span>{itemName}</span>
    </button>
);

const handleSetView = (setView, view) => () => (
    setView(view)
);