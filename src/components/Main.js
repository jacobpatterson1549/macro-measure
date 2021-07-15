import './Main.css'

import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';

import { createHandlers } from '../hooks/Database';
import { useLocalStorage } from '../hooks/LocalStorage';

import { View } from '../utils/View';
import { GROUPS, WAYPOINTS } from '../utils/Database';

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
    (mainViews[props.view] || getListView)(props)
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
    />
);

const getItemView = (props) => (
    <Item
        distanceUnit={props.distanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        {...getProps(props)}
    />
);

const getListView = (props) => (
    <NameList
        {...getProps(props)}
    />
);

const getProps = (props) => {
    if (View.isGroup(props.view)) {
        return {
            db: props.db,
            view: props.view,
            itemID: props.groupID,
            objectStoreName: GROUPS,
            type: 'group',
            ...createHandlers(props.db, GROUPS, props.setGroupID, props.setView, View.isGroup),
        };
    }
    if (View.isWaypoint(props.view)) {
        return {
            db: props.db,
            view: props.view,
            itemID: props.waypointID,
            parentItemID: props.groupID,
            objectStoreName: WAYPOINTS,
            type: 'waypoint',
            ...createHandlers(props.db, WAYPOINTS, props.setWaypointID, props.setView, View.isWaypoint),
        };
    }
    return {};
};

const mainViews = Object.fromEntries(
    View.AllIDs
        .filter(View.isWaypoint)
        .map((viewId) => [viewId, getItemView]));
mainViews[View.Waypoint_List] = getListView;
mainViews[View.About] = getAboutView;
mainViews[View.Help] = getHelpView;
mainViews[View.Settings] = getSettingsView;