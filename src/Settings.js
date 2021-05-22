import { Form } from './Form';
import { GPSSettings } from './GPSSettings';
import { FullscreenSettings } from './FullscreenSettings';
import { LocalStorageSettings } from './LocalStorageSettings';

export const Settings = ({
    distanceUnit, // the distance length between positions
    setDistanceUnit, // function to set the distance unit
    highAccuracyGPS, // enables the GPS to be more precise
    setHighAccuracyGPS, // function to toggle using high GPS accuracy
}) => {
    return (
        <div>
            <h1>Macro Measure Settings</h1>
            <Form>
                <GPSSettings
                    distanceUnit={distanceUnit}
                    setDistanceUnit={setDistanceUnit}
                    highAccuracyGPS={highAccuracyGPS}
                    setHighAccuracyGPS={setHighAccuracyGPS}
                    />
                <FullscreenSettings />
                <LocalStorageSettings />
            </Form>
        </div>
    );
};