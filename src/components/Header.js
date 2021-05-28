import './Header.css';

import { View } from '../utils/View';

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

const headerItem = (setView, itemName, itemTitle, itemView) => {
    const viewItem = () => setView(itemView);
    return (
        <button onClick={viewItem} title={itemTitle}>
            <span>{itemName}</span>
        </button>
    );
};

export const Header = ({
    view, // the page being viewed
    setView, // function to set the main view of the app
    groups, // the groups with name properties
    groupIndex, // the group being vied
}) => (
    <header className="Header">
        {headerItem(setView, groupName(view, groups, groupIndex), 'groups list', View.Groups_Read)}
        {headerItem(setView, 'ⓘ', 'about page', View.About)}
        {headerItem(setView, '?', 'help page', View.Help)}
        {headerItem(setView, '⚙', 'edit settings', View.Settings)}
    </header>
);