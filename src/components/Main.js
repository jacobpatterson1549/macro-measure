import './Main.css'

import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item, newItem } from './Item';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

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
            const items = (props.groups && props.groups.length !== 0) ? props.groups[props.groupIndex].items : [];
            const item = (View.isCreate(props.view) || items.length === 0) ? newItem() : items[props.itemIndex];
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
                    createStart={props.createItemStart}
                    createEnd={props.createItemEnd}
                    read={props.readItem}
                    readItems={props.readItems}
                    updateStart={props.updateItemStart}
                    updateEnd={props.updateItemEnd}
                    deleteStart={props.deleteItemStart}
                    deleteEnd={props.deleteItemEnd}
                />);
        case View.Items_Read:
            const values = (props.groups && props.groups.length !== 0) ? props.groups[props.groupIndex].items : [];
            return (
                <NameList
                    type="item"
                    values={values}
                    index={props.itemIndex}
                    view={props.view}
                    createStart={props.createItemStart}
                    read={props.readItem}
                    updateStart={props.updateItemStart}
                    deleteStart={props.deleteItemStart}
                    moveUp={props.moveItemUp}
                    moveDown={props.moveItemDown}
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
                    createStart={props.createGroupStart}
                    createEnd={props.createGroupEnd}
                    read={props.readGroup}
                    updateStart={props.updateGroupStart}
                    updateEnd={props.updateGroupEnd}
                    deleteStart={props.deleteGroupStart}
                    deleteEnd={props.deleteGroupEnd}
                    moveUp={props.moveGroupUp}
                    moveDown={props.moveGroupDown}
                    cancel={props.readGroups}
                />
            );
    }
};