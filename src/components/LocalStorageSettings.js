import { useEffect, useState } from 'react';

import { Fieldset, Label, ButtonInput, FileInput } from './Form';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

export const LocalStorageSettings = () => {
    const [exportURL, setExportURL] = useState(null);
    const [exportLink, setExportLink] = useState(null);
    useEffect(() => {
        if (exportURL) {
            const now = Date.now();
            const date = new Date(now);
            const iso8601Digits = date.toISOString().replace(/[^\dZ]/g, '');
            const filename = `macro_measure_backup_${iso8601Digits}.json`;
            const anchor = (<a href={exportURL} download={filename}>{filename}</a>);
            setExportLink(anchor);
        }
        return () => revokeExportURL(exportURL);
    }, [exportURL, setExportLink]);
    const state = {
        exportURL, setExportURL,
        exportLink,
    };
    return render({ ...state });
};

const render = (props) => (
    <Fieldset caption="LocalStorage Settings">
        <Label caption="Export ALL Saved Data">
            <ButtonInput
                value="Export File"
                onClick={handleExportStorage(props.exportURL, props.setExportURL)}
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

const handleExportStorage = (exportURL, setExportURL) => async () => {
    const allJSON = await getLocalStorage();
    const file = new Blob([allJSON], { type: jsonMimeType });
    revokeExportURL(exportURL);
    const newExportURL = createExportURL(file);
    setExportURL(newExportURL);
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

const jsonMimeType = "application/json";

const createExportURL = (file) => (
    URL.createObjectURL(file)
);

const revokeExportURL = (exportURL) => (
    exportURL && URL.revokeObjectURL(exportURL)
);