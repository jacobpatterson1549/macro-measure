import './Main.css'

import { Settings } from './Settings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';

import { createHandlers } from '../hooks/Database';
import { useLocalStorage } from '../hooks/LocalStorage';

import { View } from '../utils/View';
import { GROUPS, WAYPOINTS, MAPS } from '../utils/Database';
import { units as distanceUnits } from '../utils/Distance';

export const Main = (props) => {
    const [distanceUnit, setDistanceUnit] = useLocalStorage('distanceUnit', distanceUnits[0]);
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
        db={props.db}
        distanceUnit={props.distanceUnit}
        setDistanceUnit={props.setDistanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        setHighAccuracyGPS={props.setHighAccuracyGPS}
        setView={props.setView}
    />
);

const getItemView = (props) => (
    <Item
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
            distanceUnit: props.distanceUnit,
            highAccuracyGPS: props.highAccuracyGPS,
            setGPSOn: props.setGPSOn,
            mapID: props.mapID,
            parentItemID: props.groupID,
            objectStoreName: WAYPOINTS,
            type: 'waypoint',
            ...createHandlers(props.db, WAYPOINTS, props.setWaypointID, props.setView, View.isWaypoint),
        };
    }
    if (View.isMap(props.view)) {
        return {
            db: props.db,
            view: props.view,
            itemID: props.mapID,
            objectStoreName: MAPS,
            type: 'map',
            ...createHandlers(props.db, MAPS, props.setMapID, props.setView, View.isMap),
        };
    }
    return {};
};

const mainViews = Object.fromEntries(
    View.AllIDs
        .filter((viewID) => (View.isWaypoint(viewID) || View.isMap(viewID)))
        .map((viewID) => [viewID, getItemView]));
mainViews[View.Waypoint_List] = getListView;
mainViews[View.Map_List] = getListView;
mainViews[View.About] = getAboutView;
mainViews[View.Help] = getHelpView;
mainViews[View.Settings] = getSettingsView;