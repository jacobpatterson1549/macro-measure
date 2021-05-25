import './Header.css';
import { View } from '../utils/View';

const showGroupNameViews = [
    View.Item_Create,
    View.Item_Read,
    View.Item_Update,
    View.Item_Delete,
    View.Items_Read,
    View.Item_No_Geolocation,
];

export const Header = ({
    view, // the page being viewed
    setView, // function to set the main view of the app
    groups, // the groups with name properties
    groupIndex, // the group being vied
}) => {
    const groupName = showGroupNameViews.includes(view)
        ? groups[groupIndex].name
        : '[Groups]';
    const headerItem = (itemName, itemTitle, itemView) => {
        const viewItem = () => setView(itemView);
        return (
        <button onClick={viewItem} title={itemTitle}>
            <span>{itemName}</span>
        </button>
        );
    };
    return (
        <header className="Header">
            {headerItem(groupName, 'groups list', View.Groups_Read)}
            {headerItem('ⓘ', 'about page', View.About)}
            {headerItem('?', 'help page', View.Help)}
            {headerItem('⚙', 'edit settings', View.Settings)}
        </header>
    );
};