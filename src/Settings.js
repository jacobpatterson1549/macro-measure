export const DefaultDistanceUnit = 'm';

const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi'
];

export const Settings = (props) => (
    <div>
        <h1>Macro Measure Settings</h1>
        <form>
            <label>
                <span>Distance Unit:</span>
                <select value={props.distanceUnit} onChange={(event) => props.setDistanceUnit(event.target.value)}>
                    {distanceUnits.map((unit) => (<option key={unit}>{unit}</option>))}
                </select>
            </label>
            <label>
                <span>Clear ALL Saved Data:</span>
                <input type="button" value="Clear" onClick={props.clearStorage} />
            </label>
        </form>
    </div>
);