import { Fieldset, Label, CheckboxInput, SelectInput } from './Form';

export const GPSSettings = ({ distanceUnit, setDistanceUnit, highAccuracyGPS, setHighAccuracyGPS }) => (
    <Fieldset caption="GPS Settings">
        <Label caption="Distance Unit">
            <SelectInput value={distanceUnit} values={distanceUnits} onChange={setDistanceUnit} />
        </Label>
        <Label caption="High Accuracy GPS">
            <CheckboxInput checked={highAccuracyGPS} onChange={setHighAccuracyGPS} />
        </Label>
    </Fieldset>
);

export const DefaultDistanceUnit = 'm';

const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];