import { GPSSettings } from './GPSSettings';
import { FullscreenSettings } from './FullscreenSettings';
import { StorageSettings } from './StorageSettings';
import { MapSettings } from './MapSettings';

export const Settings = (props) => (
    <div>
        <h1>Macro Measure Settings</h1>
        <GPSSettings
            distanceUnit={props.distanceUnit}
            setDistanceUnit={props.setDistanceUnit}
            highAccuracyGPS={props.highAccuracyGPS}
            setHighAccuracyGPS={props.setHighAccuracyGPS}
        />
        <FullscreenSettings />
        <StorageSettings
            db={props.db}
        />
        <MapSettings
            setView={props.setView}
        />
    </div>
);