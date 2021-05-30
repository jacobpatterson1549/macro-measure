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
                    createStart={createItemStart(setView, setItemIndex, groups, groupIndex)}
                    createEnd={createItemEnd(setView, setGroups, groups, groupIndex)}
                    read={readItem(setView, setItemIndex)}
                    readItems={readItems(setView)}
                    updateStart={updateItemStart(setView, setItemIndex)}
                    updateEnd={updateItemEnd(setView, setGroups, groups, groupIndex)}
                    deleteStart={deleteItemStart(setView, setItemIndex)}
                    deleteEnd={deleteItemEnd(setView, setGroups, groups, groupIndex)}
                />);
        case View.Items_Read:
            const values = (groups.length !== 0) ? groups[groupIndex].items : [];
            return (
                <NameList
                    type="item"
                    values={values}
                    index={itemIndex}
                    view={view}
                    createStart={createItemStart(setView, setItemIndex, groups, groupIndex)}
                    read={readItem(setView, setItemIndex)}
                    updateStart={updateItemStart(setView, setItemIndex)}
                    deleteStart={deleteItemStart(setView, setItemIndex)}
                    moveUp={moveItemUp(setView, setGroups, groups, groupIndex)}
                    moveDown={moveItemDown(setView, setGroups, groups, groupIndex)}
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
                    createStart={createGroupStart(setView)}
                    createEnd={createGroupEnd(setView, setGroups, groups)}
                    read={readGroup(setView, setGroupIndex)}
                    updateStart={updateGroupStart(setView, setGroupIndex)}
                    updateEnd={updateGroupEnd(setView, setGroups, groups)}
                    deleteStart={deleteGroupStart(setView, setGroupIndex)}
                    deleteEnd={deleteGroupEnd(setView, setGroups, groups)}
                    moveUp={moveGroupUp(setView, setGroups, groups)}
                    moveDown={moveGroupDown(setView, setGroups, groups)}
                    cancel={readGroups(setView)}
                />
            );
    }
};

// groups
const createGroupStart = (setView) => () => {
    setView(View.Group_Create);
};
const createGroupEnd = (setView, setGroups, groups) => (name) => {
    setView(View.Groups_Read);
    setGroups(Groups.createGroup(groups, name));
};
const readGroup = (setView, setGroupIndex) => (index) => {
    setView(View.Items_Read);
    setGroupIndex(index);
};
const readGroups = (setView) => () => {
    setView(View.Groups_Read);
};
const updateGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Update);
    setGroupIndex(index);
};
const updateGroupEnd = (setView, setGroups, groups) => (index, name) => {
    setView(View.Groups_Read);
    setGroups(Groups.updateGroup(groups, index, name));
};
const deleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const deleteGroupEnd = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.deleteGroup(groups, index));
};
const moveGroupUp = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupUp(groups, index));
};
const moveGroupDown = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(Groups.moveGroupDown(groups, index));
};

// items
const createItemStart = (setView, setItemIndex, groups, groupIndex) => () => {
    setView(View.Item_Create);
    setItemIndex(groups[groupIndex].items.length);
};
const createItemEnd = (setView, setGroups, groups, groupIndex) => (name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.createItem(groups, groupIndex, name, lat, lng));
};
const readItem = (setView, setItemIndex) => (index) => {
    setView(View.Item_Read);
    setItemIndex(index);
};
const readItems = (setView) => () => {
    setView(View.Items_Read);
};
const updateItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Update);
    setItemIndex(index);
};
const updateItemEnd = (setView, setGroups, groups, groupIndex) => (index, name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(Groups.updateItem(groups, groupIndex, index, name, lat, lng));
};
const deleteItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
};
const deleteItemEnd = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.deleteItem(groups, groupIndex, index));
};
const moveItemUp = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemUp(groups, groupIndex, index));
};
const moveItemDown = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(Groups.moveItemDown(groups, groupIndex, index));
};