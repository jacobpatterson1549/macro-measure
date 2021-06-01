import { useState } from 'react';

import { Fieldset, Label, ButtonInput, FileInput } from './Form';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

export const LocalStorageSettings = () => {
    const [exportLink, setExportLink] = useState(null);
    return render(exportLink, setExportLink);
};

const render = (exportLink, setExportLink) => (
    <Fieldset caption="LocalStorage Settings">
        <Label caption="Export ALL Saved Data">
            <ButtonInput value="Export File" onClick={exportStorage(setExportLink)} />
            {exportLink}
        </Label>
        <Label caption="Import ALL Saved Data">
            <FileInput accept={jsonMimeType} onChange={importStorage} />
        </Label>
        <Label caption="Clear ALL Saved Data">
            <ButtonInput value="Clear" onClick={resetStorage} />
        </Label>
        <Label caption="Reload page and Saved Data">
            <ButtonInput value="Reload" onClick={reload} />
        </Label>
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