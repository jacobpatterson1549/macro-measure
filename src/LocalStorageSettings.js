import { useState } from 'react';

import { ButtonInput } from './Form'
import { getLocalStorage, setLocalStorage, clearLocalStorage } from './LocalStorage';

const jsonMimeType = "application/json";

const dateDigits = () => {
    const date = new Date();
    const isoDate = date.toISOString();
    const dateDigits = isoDate.replace(/\D/g, '');
    return dateDigits;
};

export const LocalStorageSettings = () => {

    const [exportLink, setExportLink] = useState(null);

    const _exportStorage = () => {
        const allJSON = getLocalStorage();
        const file = new Blob([allJSON], { type: jsonMimeType })
        const url = URL.createObjectURL(file);
        const filename = `Macro Measure ${dateDigits()} backup.json`;
        const anchor = (<a href={url} download={filename}>{filename}</a>);
        setExportLink(anchor);
    };

    const _importStorage = async (event) => {
        const file = event.target.files[0];
        const allJSON = await file.text();
        clearLocalStorage();
        setLocalStorage(allJSON);
        _reload();
    };

    const _resetStorage = () => {
        clearLocalStorage();
        _reload();
    };

    const _reload = () => {
        window.location.reload(); // force all states to be refreshed
    }

    return (
        <fieldset>
            <legend>LocalStorage Settings</legend>
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
            <label>
                <span>Reload page and Saved Data:</span>
                <ButtonInput value="Reload" onClick={_reload} />
            </label>
        </fieldset>
    );
};