import './Main.css'

import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item, newItem } from './Item';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';
import {
    createGroup, updateGroup, deleteGroup, moveGroupUp, moveGroupDown,
    createItem, updateItem, deleteItem, moveItemUp, moveItemDown,
} from '../utils/Groups';

export const Main = (props) => {
    const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', DefaultDistanceUnit);
    const [highAccuracyGPS, setHighAccuracyGPS] = useLocalStorage('highAccuracyGPS', false);
    return render({ ...props, distanceUnit, setDistanceUnit, highAccuracyGPS, setHighAccuracyGPS });
}

const render = (props) => (
    <main className="Main">
        {getMain(props)}
    </main>
);

const getMain = (props) => {
    switch (props.view) {
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
                    distanceUnit={props.distanceUnit}
                    setDistanceUnit={props.setDistanceUnit}
                    highAccuracyGPS={props.highAccuracyGPS}
                    setHighAccuracyGPS={props.setHighAccuracyGPS}
                    fullscreen={props.fullscreen}
                    onLine={props.onLine}
                    installPromptEvent={props.installPromptEvent}
                />);
        case View.Item_Create:
        case View.Item_Read:
        case View.Item_Update:
        case View.Item_Delete:
            const items = (props.groups.length !== 0) ? props.groups[props.groupIndex].items : [];
            const item = (props.view === View.Item_Create || items.length === 0) ? newItem() : items[props.itemIndex];
            return (
                <Item key={props.itemIndex}
                    view={props.view}
                    items={items}
                    index={props.itemIndex}
                    name={item.name}
                    lat={item.lat}
                    lng={item.lng}
                    distanceUnit={props.distanceUnit}
                    highAccuracyGPS={props.highAccuracyGPS}
                    createStart={handleCreateItemStart(props.setView, props.setItemIndex, props.groups, props.groupIndex)}
                    createEnd={handleCreateItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex)}
                    read={handleReadItem(props.setView, props.setItemIndex)}
                    readItems={handleReadItems(props.setView)}
                    updateStart={handleUpdateItemStart(props.setView, props.setItemIndex)}
                    updateEnd={handleUpdateItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex)}
                    deleteStart={handleDeleteItemStart(props.setView, props.setItemIndex)}
                    deleteEnd={handleDeleteItemEnd(props.setView, props.setGroups, props.groups, props.groupIndex)}
                />);
        case View.Items_Read:
            const values = (props.groups.length !== 0) ? props.groups[props.groupIndex].items : [];
            return (
                <NameList
                    type="item"
                    values={values}
                    index={props.itemIndex}
                    view={props.view}
                    createStart={handleCreateItemStart(props.setView, props.setItemIndex, props.groups, props.groupIndex)}
                    read={handleReadItem(props.setView, props.setItemIndex)}
                    updateStart={handleUpdateItemStart(props.setView, props.setItemIndex)}
                    deleteStart={handleDeleteItemStart(props.setView, props.setItemIndex)}
                    moveUp={handleMoveItemUp(props.setView, props.setGroups, props.groups, props.groupIndex)}
                    moveDown={handleMoveItemDown(props.setView, props.setGroups, props.groups, props.groupIndex)}
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
                    values={props.groups}
                    index={props.groupIndex}
                    view={props.view}
                    createStart={handleCreateGroupStart(props.setView)}
                    createEnd={handleCreateGroupEnd(props.setView, props.setGroups, props.groups)}
                    read={handleReadGroup(props.setView, props.setGroupIndex)}
                    updateStart={handleUpdateGroupStart(props.setView, props.setGroupIndex)}
                    updateEnd={handleUpdateGroupEnd(props.setView, props.setGroups, props.groups)}
                    deleteStart={handleDeleteGroupStart(props.setView, props.setGroupIndex)}
                    deleteEnd={handleDeleteGroupEnd(props.setView, props.setGroups, props.groups)}
                    moveUp={handleMoveGroupUp(props.setView, props.setGroups, props.groups)}
                    moveDown={handleMoveGroupDown(props.setView, props.setGroups, props.groups)}
                    cancel={handleReadGroups(props.setView)}
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
    setGroups(createGroup(groups, name));
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
    setGroups(updateGroup(groups, index, name));
};
const handleDeleteGroupStart = (setView, setGroupIndex) => (index) => {
    setView(View.Group_Delete);
    setGroupIndex(index);
};
const handleDeleteGroupEnd = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(deleteGroup(groups, index));
};
const handleMoveGroupUp = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(moveGroupUp(groups, index));
};
const handleMoveGroupDown = (setView, setGroups, groups) => (index) => {
    setView(View.Groups_Read);
    setGroups(moveGroupDown(groups, index));
};

// items
const handleCreateItemStart = (setView, setItemIndex, groups, groupIndex) => () => {
    setView(View.Item_Create);
    setItemIndex(groups[groupIndex].items.length);
};
const handleCreateItemEnd = (setView, setGroups, groups, groupIndex) => (name, lat, lng) => {
    setView(View.Item_Read);
    setGroups(createItem(groups, groupIndex, name, lat, lng));
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
    setGroups(updateItem(groups, groupIndex, index, name, lat, lng));
};
const handleDeleteItemStart = (setView, setItemIndex) => (index) => {
    setView(View.Item_Delete);
    setItemIndex(index);
};
const handleDeleteItemEnd = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(deleteItem(groups, groupIndex, index));
};
const handleMoveItemUp = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(moveItemUp(groups, groupIndex, index));
};
const handleMoveItemDown = (setView, setGroups, groups, groupIndex) => (index) => {
    setView(View.Items_Read);
    setGroups(moveItemDown(groups, groupIndex, index));
};