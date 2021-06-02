import './Header.css';

import { View } from '../utils/View';

export const Header = ({ view, setView, groups, groupIndex }) => (
    <header className="Header">
        {getHeaderItem(setView, getGroupName(view, groups, groupIndex), 'groups list', View.Group_Read_List)}
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
    View.Item_Read_List,
];

const getGroupName = (view, groups, groupIndex) => (
    (showGroupNameViews.includes(view) && groups.length !== 0)
        ? groups[groupIndex].name
        : '[Groups]'
);

const getHeaderItem = (setView, itemName, itemTitle, itemView) => (
    <button onClick={handleSetView(setView, itemView)} title={itemTitle}>
        <span>{itemName}</span>
    </button>
);

const handleSetView = (setView, view) => () => (
    setView(view)
);