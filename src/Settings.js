import { Form, ButtonInput } from './Form'

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
    clearStorage, // function to clear all state
}) => (
    <div>
        <h1>Macro Measure Settings</h1>
        <Form>
            <label>
                <span>Distance Unit:</span>
                <select value={distanceUnit} onChange={(event) => setDistanceUnit(event.target.value)}>
                    {distanceUnits.map((unit) => (<option key={unit}>{unit}</option>))}
                </select>
            </label>
            <label>
                <span>Clear ALL Saved Data:</span>
                <ButtonInput value="Clear" onClick={clearStorage} />
            </label>
        </Form>
    </div>
);