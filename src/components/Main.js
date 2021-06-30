import './Main.css'

import { Settings } from './Settings';
import { DefaultDistanceUnit } from './GPSSettings';
import { About } from './About';
import { Help } from './Help';
import { NameList } from './NameList';
import { Item } from './Item';

import { createHandlers } from '../hooks/Database';

import { useLocalStorage } from '../utils/LocalStorage';
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
    (mainViews[props.view] || getGroupsView)(props)
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

const getWaypointsView = (props) => (
    <Item
        itemID={props.waypointID}
        parentItemID={props.groupID}
        objectStoreName={WAYPOINTS}
        type={'waypoint'}
        view={props.view}
        distanceUnit={props.distanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        {...createHandlers(WAYPOINTS, props.setWaypointID, props.setView, View.isWaypoint)}
    />
);

const getGroupsView = (props) => (
    <NameList
        itemID={props.groupID}
        objectStoreName={GROUPS}
        type={'group'}
        view={props.view}
        {...createHandlers(GROUPS, props.setGroupID, props.setView, View.isGroup)}
    />
);

const mainViews = Object.fromEntries(
    View.AllIDs
        .filter(View.isWaypoint)
        .map((viewId) => [viewId, getWaypointsView]));
mainViews[View.Group_Read] = getWaypointsView;
mainViews[View.About] = getAboutView;
mainViews[View.Help] = getHelpView;
mainViews[View.Settings] = getSettingsView;