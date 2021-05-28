import { useState } from 'react';

import { ButtonInput, FileInput } from './Form';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

const jsonMimeType = "application/json";

const dateDigits = () => {
    const date = new Date();
    const isoDate = date.toISOString();
    const isoDateDigits = isoDate.replace(/\D/g, '');
    return isoDateDigits;
};

const _exportStorage = (setExportLink) => () => {
    const allJSON = getLocalStorage();
    const file = new Blob([allJSON], { type: jsonMimeType })
    const url = URL.createObjectURL(file);
    const filename = `macro_measure_backup_${dateDigits()}.json`;
    const anchor = (<a href={url} download={filename}>{filename}</a>);
    setExportLink(anchor);
};

const _importStorage = async (file) => {
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

export const LocalStorageSettings = () => {

    const [exportLink, setExportLink] = useState(null);

    return (
        <fieldset>
            <legend>LocalStorage Settings</legend>
            <label>
                <span>Export ALL Saved Data:</span>
                <ButtonInput value="Export File" onClick={_exportStorage(setExportLink)} />
                {exportLink}
            </label>
            <label>
                <span>Import ALL Saved Data:</span>
                <FileInput accept={jsonMimeType} onChange={_importStorage} />
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