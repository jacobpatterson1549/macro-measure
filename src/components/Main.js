import './Main.css'

import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const Main = (props) => {
    const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', DefaultDistanceUnit);
    const [highAccuracyGPS, setHighAccuracyGPS] = useLocalStorage('highAccuracyGPS', false);
    const state = {
        distanceUnit, setDistanceUnit,
        highAccuracyGPS, setHighAccuracyGPS,
    };
    return render({ ...props, ...state });
}

const render = (props) => (
    <main className="Main">
        {getMain(props)}
    </main>
);

const getMain = (props) => (
    props.view === View.About ? getAboutView(props)
        : props.view === View.Help ? getHelpView(props)
            : props.view === View.Settings ? getSettingsView(props)
                : View.isItem(props.view) ? getItemsView(props)
                    : getGroupsView(props)
);

const getAboutView = (props) => (
    <About />
);

const getHelpView = (props) => (
    <Help />
);

const getSettingsView = (props) => (
    <Settings
        distanceUnit={props.distanceUnit}
        setDistanceUnit={props.setDistanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        setHighAccuracyGPS={props.setHighAccuracyGPS}
        fullscreen={props.fullscreen}
        onLine={props.onLine}
        installPromptEvent={props.installPromptEvent}
    />
);

const getItemsView = (props) => (
    <Item
        view={props.view}
        items={getItemsFromGroups(props)}
        index={props.itemIndex}
        distanceUnit={props.distanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        createStart={props.createItemStart}
        createEnd={props.createItemEnd}
        read={props.readItem}
        readItemList={props.readItemList}
        updateStart={props.updateItemStart}
        updateEnd={props.updateItemEnd}
        deleteStart={props.deleteItemStart}
        deleteEnd={props.deleteItemEnd}
        setGPSOn={props.setGPSOn}
        moveUp={props.moveItemUp}
        moveDown={props.moveItemDown}
    />
);

const getGroupsView = (props) => (
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
        cancel={props.readGroupList}
    />
);

const getItemsFromGroups = ({ groups, groupIndex }) => (
    (groups?.length) ? groups[groupIndex].items : []
);