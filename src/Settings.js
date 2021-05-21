import { useState } from 'react';

import { Form, ButtonInput } from './Form'

export const DefaultDistanceUnit = 'm';

const distanceUnits = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];

const jsonMimeType = "application/json";

export const Settings = ({
    distanceUnit, // the distance length between positions
    setDistanceUnit, // function to set the distance unit
    highAccuracyGPS, // enables the GPS to be more precise
    setHighAccuracyGPS, // function to toggle using high GPS accuracy
    clearStorage, // function to clear all state
    getStorage, // function to get all state as JSON
    setStorage, // function to set all state from JSON
}) => {

    const [exportLink, setExportLink] = useState(null);

    const _resetStorage = () => {
        clearStorage();
        window.location.reload(); // force all states to be refreshed
    };

    const _exportStorage = () => {
        const allJSON = getStorage();
        const date = new Date();
        const isoDate = date.toISOString();
        const dateDigits = isoDate.replace(/\D/g, '');
        const filename = `Macro Measure ${dateDigits} backup.json`;
        const file = new Blob([allJSON], { type: jsonMimeType })
        const url = URL.createObjectURL(file);
        const anchor = (<a href={url} download={filename}>{filename}</a>);
        setExportLink(anchor);
    };

    const _importStorage = async (event) => {
        const file = event.target.files[0];
        const allJSON = await file.text();
        clearStorage();
        setStorage(allJSON);
        window.location.reload(); // force all states to be refreshed
    };

    return (
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
                    <span>High Accuracy GPS</span>
                    <input type="checkbox" checked={highAccuracyGPS} onChange={(event) => setHighAccuracyGPS(event.target.checked)} />
                </label>
                <label>
                    <span>Export ALL Saved Data:</span>
                    <ButtonInput value="Export File" onClick={_exportStorage} />
                    {exportLink}
                </label>
                <label>
                    <span>Import ALL Saved Data:</span>
                    <input type="file" accept={jsonMimeType} onChange={_importStorage} />
                </label>
                <label>
                    <span>Clear ALL Saved Data:</span>
                    <ButtonInput value="Clear" onClick={_resetStorage} />
                </label>
            </Form>
        </div>
    );
};