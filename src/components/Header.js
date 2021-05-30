import './Header.css';

import { View } from '../utils/View';

export const Header = ({ view, setView, groups, groupIndex }) => (
    <header className="Header">
        {getHeaderItem(setView, groupName(view, groups, groupIndex), 'groups list', View.Groups_Read)}
        {getHeaderItem(setView, 'ⓘ', 'about page', View.About)}
        {getHeaderItem(setView, '?', 'help page', View.Help)}
        {getHeaderItem(setView, '⚙', 'edit settings', View.Settings)}
    </header>
);

const showGroupNameViews = [
    View.Item_Create,
    View.Item_Read,
    View.Item_Update,
    View.Item_Delete,
    View.Items_Read,
];

const groupName = (view, groups, groupIndex) => (
    (showGroupNameViews.includes(view) && groups.length !== 0)
        ? groups[groupIndex].name
        : '[Groups]'
);

const getHeaderItem = (setView, itemName, itemTitle, itemView) => (
    <button onClick={viewItem(setView, itemView)} title={itemTitle}>
        <span>{itemName}</span>
    </button>
);

const viewItem = (setView, itemView) => () => (
    setView(itemView)
);