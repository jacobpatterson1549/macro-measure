import { CheckboxInput, SelectInput } from './Form';

export const GPSSettings = ({
    distanceUnit, // the distance length between positions
    setDistanceUnit, // function to set the distance unit
    highAccuracyGPS, // enables the GPS to be more precise
    setHighAccuracyGPS, // function to toggle using high GPS accuracy
}) => (
    <fieldset>
        <legend>GPS Settings</legend>
        <label>
            <span>Distance Unit:</span>
            <SelectInput value={distanceUnit} values={distanceUnits} onChange={setDistanceUnit} />
        </label>
        <label>
            <span>High Accuracy GPS:</span>
            <CheckboxInput checked={highAccuracyGPS} onChange={setHighAccuracyGPS} />
        </label>
    </fieldset>
);

export const DefaultDistanceUnit = 'm';

const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];