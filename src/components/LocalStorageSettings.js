import { useState } from 'react';

import { Fieldset, ButtonInput, FileInput } from './Form';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

export const LocalStorageSettings = () => {
    const [exportLink, setExportLink] = useState(null);
    return render(exportLink, setExportLink);
};

const render = (exportLink, setExportLink) => (
    <Fieldset caption='LocalStorage Settings'>
        <label>
            <span>Export ALL Saved Data:</span>
            <ButtonInput value="Export File" onClick={exportStorage(setExportLink)} />
            {exportLink}
        </label>
        <label>
            <span>Import ALL Saved Data:</span>
            <FileInput accept={jsonMimeType} onChange={importStorage} />
        </label>
        <label>
            <span>Clear ALL Saved Data:</span>
            <ButtonInput value="Clear" onClick={resetStorage} />
        </label>
        <label>
            <span>Reload page and Saved Data:</span>
            <ButtonInput value="Reload" onClick={reload} />
        </label>
    </Fieldset>
);

const exportStorage = (setExportLink) => () => {
    const allJSON = getLocalStorage();
    const file = new Blob([allJSON], { type: jsonMimeType })
    const url = URL.createObjectURL(file);
    const filename = `macro_measure_backup_${dateDigits()}.json`;
    const anchor = (<a href={url} download={filename}>{filename}</a>);
    setExportLink(anchor);
};

const importStorage = async (file) => {
    const allJSON = await file.text();
    clearLocalStorage();
    setLocalStorage(allJSON);
    reload();
};

const resetStorage = () => {
    clearLocalStorage();
    reload();
};

const reload = () => {
    window.location.reload(); // force all states to be refreshed
}

const dateDigits = () => {
    const date = new Date();
    const isoDate = date.toISOString();
    const isoDateDigits = isoDate.replace(/\D/g, '');
    return isoDateDigits;
};

const jsonMimeType = "application/json";