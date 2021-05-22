const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];

export const DefaultDistanceUnit = 'm';

export const GPSSettings = ({
    distanceUnit, // the distance length between positions
    setDistanceUnit, // function to set the distance unit
    highAccuracyGPS, // enables the GPS to be more precise
    setHighAccuracyGPS, // function to toggle using high GPS accuracy
}) => {
    const _distanceUnits = distanceUnits.map((unit) => (<option key={unit}>{unit}</option>));
    const _setDistanceUnit = (event) => setDistanceUnit(event.target.value);
    const _setHighAccuracyGPS = (event) => setHighAccuracyGPS(event.target.checked);
    return (
        <fieldset>
            <legend>GPS Settings</legend>
            <label>
                <span>Distance Unit:</span>
                <select value={distanceUnit} onChange={_setDistanceUnit}>
                    {_distanceUnits}
                </select>
            </label>
            <label>
                <span>High Accuracy GPS:</span>
                <input type="checkbox" checked={highAccuracyGPS} onChange={_setHighAccuracyGPS} />
            </label>
        </fieldset>
    );
};