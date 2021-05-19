import './Header.css';

export const Header = ({
    view, // the page being viewed
    setView, // function to set the main view of the app
    groups, // the groups with name properties
    groupIndex, // the group being vied
}) => {
    const groupName = /^item(s|(-\w+))$/.test(view)
        ? groups[groupIndex].name
        : '[Groups]';
    const headerItem = (itemName, itemTitle, itemView) => (
        <button onClick={() => setView(itemView)} title={itemTitle}>
            <span>{itemName}</span>
        </button>
    );
    return (
        <header className="Header">
            {headerItem(groupName, 'groups list', 'groups')}
            {headerItem('ⓘ', 'about page', 'about')}
            {headerItem('?', 'help page', 'help')}
            {headerItem('⚙', 'edit settings', 'settings')}
        </header>
    );
};