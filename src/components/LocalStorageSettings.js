import { useState } from 'react';

import { Fieldset, Label, ButtonInput, FileInput } from './Form';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

export const LocalStorageSettings = () => {
    const [exportLink, setExportLink] = useState(null);
    const state = {
        exportLink, setExportLink
    };
    return render({ ...state });
};

const render = (props) => (
    <Fieldset caption="LocalStorage Settings">
        <Label caption="Export ALL Saved Data">
            <ButtonInput
                value="Export File"
                onClick={handleExportStorage(props.setExportLink)}
            />
            {props.exportLink}
        </Label>
        <Label caption="Import ALL Saved Data">
            <FileInput
                accept={jsonMimeType}
                onChange={handleImportStorage()}
            />
        </Label>
        <Label caption="Clear ALL Saved Data">
            <ButtonInput
                value="Clear"
                onClick={handleResetStorage()}
            />
        </Label>
        <Label caption="Reload page and Saved Data">
            <ButtonInput
                value="Reload"
                onClick={reload}
            />
        </Label>
    </Fieldset>
);

const handleExportStorage = (setExportLink) => () => {
    const allJSON = getLocalStorage();
    const file = new Blob([allJSON], { type: jsonMimeType });
    const url = URL.createObjectURL(file);
    const filename = `macro_measure_backup_${_getISO8601Digits(new Date())}.json`;
    const anchor = (<a href={url} download={filename}>{filename}</a>);
    setExportLink(anchor);
};

const handleImportStorage = () => async (file) => {
    const allJSON = await file.text();
    clearLocalStorage();
    setLocalStorage(allJSON);
    reload();
};

const handleResetStorage = () => () => {
    clearLocalStorage();
    reload();
};

const reload = () => {
    window.location.reload(); // force all states to be refreshed
};

export const _getISO8601Digits = (date) => ( // exported for testing
    date.toISOString().replace(/[^\dZ]/g, '')
);

const jsonMimeType = "application/json";