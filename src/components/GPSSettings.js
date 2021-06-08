import { Fieldset, Label, SelectInput, CheckboxInput } from './Form';

export const GPSSettings = (props) => (
    <Fieldset caption="GPS Settings">
        <Label caption="Distance Unit">
            <SelectInput
                value={props.distanceUnit}
                values={distanceUnits}
                onChange={props.setDistanceUnit}
            />
        </Label>
        <Label caption="High Accuracy GPS">
            <CheckboxInput
                checked={props.highAccuracyGPS}
                onChange={props.setHighAccuracyGPS}
            />
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