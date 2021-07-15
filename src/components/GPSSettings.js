import { Fieldset, Label, SelectInput, CheckboxInput } from './Form';

import { units as distanceUnits } from '../utils/Distance';

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