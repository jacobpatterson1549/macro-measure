import './Header.css';

import { useItem } from '../hooks/Database';

import { View } from '../utils/View';
import { GROUPS } from '../utils/Database';

export const Header = (props) => {
    const [group] = useItem(GROUPS, props.groupID);
    const state = {
        group,
    };
    return render({ ...props, ...state });
};

const render = ({ group, view, setView }) => (
    <header className="Header">
        {getHeaderItem(setView, getGroupName(view, group), 'groups list', View.Group_List)}
        {getHeaderItem(setView, 'ⓘ', 'about page', View.About)}
        {getHeaderItem(setView, '?', 'help page', View.Help)}
        {getHeaderItem(setView, '⚙', 'edit settings', View.Settings)}
    </header>
);

const getGroupName = (view, group) => (
    (View.isWaypoint(view) && group?.name)
        ? group.name
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