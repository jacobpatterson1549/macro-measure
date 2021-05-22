import { useState } from 'react';
import { Form } from './Form';
import { LocalStorageSettings } from './LocalStorageSettings';

export const DefaultDistanceUnit = 'm';

const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];

export const Settings = ({
    distanceUnit, // the distance length between positions
    setDistanceUnit, // function to set the distance unit
    highAccuracyGPS, // enables the GPS to be more precise
    setHighAccuracyGPS, // function to toggle using high GPS accuracy
}) => {
    const _distanceUnits = distanceUnits.map((unit) => (<option key={unit}>{unit}</option>));
    const _setDistanceUnit = (event) => setDistanceUnit(event.target.value);
    const _setHighAccuracyGPS = (event) => setHighAccuracyGPS(event.target.checked);
    const [fullScreen, setFullScreen] = useState(!!document.fullscreenElement);
    const requestFullscreen = () => {
        document.body.requestFullscreen()
            .then(() => setFullScreen(true));
    };
    const exitFullscreen = () => {
        document.exitFullscreen();
        setFullScreen(false)
    }
    const _toggleFullscreen = (event) => (event.target.checked) ? requestFullscreen() : exitFullscreen();
    return (
        <div>
            <h1>Macro Measure Settings</h1>
            <Form>
                <fieldset>
                    <legend>GPS Settings</legend>
                    <label>
                        <span>Distance Unit:</span>
                        <select value={distanceUnit} onChange={_setDistanceUnit}>
                            {_distanceUnits}
                        </select>
                    </label>
                    <label>
                        <span>High Accuracy GPS</span>
                        <input type="checkbox" checked={highAccuracyGPS} onChange={_setHighAccuracyGPS} />
                    </label>
                </fieldset>
                <fieldset>
                    <legend>Fullscreen Settings</legend>
                    < label >
                        <span>FullScreen:</span>
                        <input type="checkbox" checked={fullScreen} onChange={_toggleFullscreen} />
                    </label>
                </fieldset>
                <LocalStorageSettings />
            </Form>
        </div>
    );
};