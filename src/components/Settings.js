import { Form } from './Form';
import { GPSSettings } from './GPSSettings';
import { FullscreenSettings } from './FullscreenSettings';
import { LocalStorageSettings } from './LocalStorageSettings';

export const Settings = (props) => (
    <div>
        <h1>Macro Measure Settings</h1>
        <Form>
            <GPSSettings
                distanceUnit={props.distanceUnit}
                setDistanceUnit={props.setDistanceUnit}
                highAccuracyGPS={props.highAccuracyGPS}
                setHighAccuracyGPS={props.setHighAccuracyGPS}
            />
            <FullscreenSettings
                fullscreen={props.fullscreen}
                onLine={props.onLine}
                installPromptEvent={props.installPromptEvent}
            />
            <LocalStorageSettings />
        </Form>
    </div>
);