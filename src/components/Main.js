import './Main.css'

import { Groups } from '../utils/Groups';
import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item, newItem } from './Item';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Main = ({
    fullscreen,
    onLine,
    installPromptEvent,
    view, setView,
    groups, setGroups,
    groupIndex, setGroupIndex,
    itemIndex, setItemIndex,
}) => {
    const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', DefaultDistanceUnit);
    const [highAccuracyGPS, setHighAccuracyGPS] = useLocalStorage('highAccuracyGPS', false);
    return (
        <main className="Main">
            {getMain(distanceUnit, setDistanceUnit, highAccuracyGPS, setHighAccuracyGPS, fullscreen, onLine, installPromptEvent, view, setView, groups, setGroups, groupIndex, setGroupIndex, itemIndex, setItemIndex)}
        </main>
    );
}

const getMain = (distanceUnit, setDistanceUnit, highAccuracyGPS, setHighAccuracyGPS, fullscreen, onLine, installPromptEvent, view, setView, groups, setGroups, groupIndex, setGroupIndex, itemIndex, setItemIndex) => {
    switch (view) {
        case View.About:
            return (
                <About
                />);
        case View.Help:
            return (
                <Help
                />);
        case View.Settings:
            return (
                <Settings
                    distanceUnit={distanceUnit}
                    setDistanceUnit={setDistanceUnit}
                    highAccuracyGPS={highAccuracyGPS}
                    setHighAccuracyGPS={setHighAccuracyGPS}
                    fullscreen={fullscreen}
                    onLine={onLine}
                    installPromptEvent={installPromptEvent}
                />);
        case View.Item_Create:
        case View.Item_Read:
        case View.Item_Update:
        case View.Item_Delete:
            const items = (groups.length !== 0) ? groups[groupIndex].items : [];
            const item = (view === View.Item_Create || items.length === 0) ? newItem() : items[itemIndex];
            return (
                <Item key={itemIndex}
                    view={view}
                    items={items}
                    index={itemIndex}
                    name={item.name}
                    lat={item.lat}
                    lng={item.lng}
                    distanceUnit={distanceUnit}
                    highAccuracyGPS={highAccuracyGPS}
                    createStart={handleCreateItemStart(setView, setItemIndex, groups, groupIndex)}
                    createEnd={handleCreateItemEnd(setView, setGroups, groups, groupIndex)}
                    read={handleReadItem(setView, setItemIndex)}
                    readItems={handleReadItems(setView)}
                    updateStart={handleUpdateItemStart(setView, setItemIndex)}
                    updateEnd={handleUpdateItemEnd(setView, setGroups, groups, groupIndex)}
                    deleteStart={handleDeleteItemStart(setView, setItemIndex)}
                    deleteEnd={handleDeleteItemEnd(setView, setGroups, groups, groupIndex)}
                />);
        case View.Items_Read:
            const values = (groups.length !== 0) ? groups[groupIndex].items : [];
            return (
                <NameList
                    type="item"
                    values={values}
                    index={itemIndex}
                    view={view}
                    createStart={handleCreateItemStart(setView, setItemIndex, groups, groupIndex)}
                    read={handleReadItem(setView, setItemIndex)}
                    updateStart={handleUpdateItemStart(setView, setItemIndex)}
                    deleteStart={handleDeleteItemStart(setView, setItemIndex)}
                    moveUp={handleMoveItemUp(setView, setGroups, groups, groupIndex)}
                    moveDown={handleMoveItemDown(setView, setGroups, groups, groupIndex)}
                />
            );
        case View.Group_Create:
        case View.Group_Update:
        case View.Group_Delete:
        case View.Groups_Read:
        default:
            return (
                <NameList
                    type="group"
                    values={groups}
                    index={groupIndex}
                    view={view}
                    createStart={handleCreateGroupStart(setView)}
                    createEnd={handleCreateGroupEnd(setView, setGroups, groups)}
                    read={handleReadGroup(setView, setGroupIndex)}
                    updateStart={handleUpdateGroupStart(setView, setGroupIndex)}
                    updateEnd={handleUpdateGroupEnd(setView, setGroups, groups)}
                    deleteStart={handleDeleteGroupStart(setView, setGroupIndex)}
                    deleteEnd={handleDeleteGroupEnd(setView, setGroups, groups)}
                    moveUp={handleMoveGroupUp(setView, setGroups, groups)}
                    moveDown={handleMoveGroupDown(setView, setGroups, groups)}
                    cancel={handleReadGroups(setView)}
                />
            );
    }
};

// groups
const handleCreateGroupStart = (setView) => () => {
    setView(View.Group_Create);
};
const handleCreateGroupEnd = (setView, setGroups, groups) => (name) => {
    setView(View.Groups_Read);
    setGroups(Groups.createGroup(groups, name));
};
const handleReadGroup = (setView, setGroupIndex) => (index) => {
    setView(View.Items_Read);
    setGroupIndex(index);
};
const handleReadGroups = (setView) => () => {
    setView(View.Groups_Read);
};
const handleUpdateGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Update);
    setGroupIndex(index);
};
const handleUpdateGroupEnd = (setView, setGroups, groups) => (index, name) => {
    setView(View.Groups_Read);
    setGroups(Groups.updateGroup(groups, index, name));
};
const handleDeleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const handleDeleteGroupEnd = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.deleteGroup(groups, index));
};
const handleMoveGroupUp = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupUp(groups, index));
};
const handleMoveGroupDown = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupDown(groups, index));
};

// items
const handleCreateItemStart = (setView, setItemIndex, groups, groupIndex) => () => {
    setView(View.Item_Create);
    setItemIndex(groups[groupIndex].items.length);
};
const handleCreateItemEnd = (setView, setGroups, groups, groupIndex) => (name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.createItem(groups, groupIndex, name, lat, lng));
};
const handleReadItem = (setView, setItemIndex) => (index) => {
    setView(View.Item_Read);
    setItemIndex(index);
};
const handleReadItems = (setView) => () => {
    setView(View.Items_Read);
};
const handleUpdateItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Update);
    setItemIndex(index);
};
const handleUpdateItemEnd = (setView, setGroups, groups, groupIndex) => (index, name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.updateItem(groups, groupIndex, index, name, lat, lng));
};
const handleDeleteItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
};
const handleDeleteItemEnd = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.deleteItem(groups, groupIndex, index));
};
const handleMoveItemUp = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemUp(groups, groupIndex, index));
};
const handleMoveItemDown = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemDown(groups, groupIndex, index));
};