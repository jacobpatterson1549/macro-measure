import { useEffect, useState } from 'react';

import { Fieldset, Label, ButtonInput, FileInput } from './Form';

import { getCurrentDate, reloadWindow, createObjectURL, revokeObjectURL }  from '../utils/Global';
import { getAll as getAllDatabase, deleteDatabase } from '../utils/Database';
import { getAll as getAllLocalStorage, setAll as setAllLocalStorage, clear as clearLocalStorage } from '../utils/LocalStorage';

export const StorageSettings = (props) => {
    const [exportURL, setExportURL] = useState(null);
    const [exportLink, setExportLink] = useState(null);
    useEffect(() => {
        if (exportURL) {
            const currentDate = getCurrentDate();
            const filename = `macro_measure_backup_${currentDate}.json`;
            const anchor = (<a href={exportURL} download={filename}>{filename}</a>);
            setExportLink(anchor);
        }
        return () => revokeExportURL(exportURL);
    }, [exportURL, setExportLink]);
    const state = {
        exportURL, setExportURL,
        exportLink,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <Fieldset caption="Storage Settings">
        <Label caption="Export ALL Saved Data">
            <ButtonInput
                value="Export File"
                onClick={handleExportStorage(props)}
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
                onClick={handleResetStorage(props)}
            />
        </Label>
        <Label caption="Reload page and Saved Data">
            <ButtonInput
                value="Reload"
                onClick={reloadWindow}
            />
        </Label>
    </Fieldset>
);

const handleExportStorage = ({ db, exportURL, setExportURL }) => async () => {
    const localStorageObject = getAllLocalStorage();
    const databaseObject = await getAllDatabase(db);
    const storage = {
        ...localStorageObject,
        ...databaseObject,
    };
    const file = new Blob([storage], { type: jsonMimeType });
    revokeExportURL(exportURL);
    const newExportURL = createExportURL(file);
    setExportURL(newExportURL);
};

const handleImportStorage = () => async (file) => {
    const allJSON = await file.text();
    clearLocalStorage();
    setAllLocalStorage(allJSON);
    reloadWindow();
};

const handleResetStorage = () => async () => {
    clearLocalStorage();
    await deleteDatabase();
    reloadWindow();
};

const jsonMimeType = "application/json";

const createExportURL = createObjectURL;

const revokeExportURL = (exportURL) => (
    exportURL && revokeObjectURL(exportURL)
);