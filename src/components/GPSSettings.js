import { CheckboxInput, SelectInput } from './Form';

export const GPSSettings = ({ distanceUnit, setDistanceUnit, highAccuracyGPS, setHighAccuracyGPS }) => (
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