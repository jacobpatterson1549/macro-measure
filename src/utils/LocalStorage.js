import { useState } from 'react';

import { deleteDatabase, getDatabaseAsObject } from './Database';
import { getLocalStorage } from './Global';


export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => (
        JSON.parse(
            getLocalStorage().getItem(key)
            || JSON.stringify(defaultValue))
    ));
    return [value, handleSetValue(key, setValue)];
};

export const clearLocalStorage = async () => {
    getLocalStorage().clear();
    // TODO add another button to clear storage, but not database (this might fix some problems)
    await deleteDatabase();
};

export const getLocalStorageJSON = async () => { // TODO: rename to getLocalStorageAsObject, have component combine with db
    const ls =  Object.fromEntries(
        Array.from(Array(getLocalStorage().length).keys()) // [0 .. storage.length)
            .map(
                (i) => (
                    getLocalStorage().key(i)))
            .reduce(
                (map, key) => (
                    map.set(
                        key,
                        JSON.parse(getLocalStorage().getItem(key)))),
                new Map())
            .entries());
    const db = await getDatabaseAsObject();
    const combinedStorage = Object.assign(ls, db);
    return JSON.stringify(combinedStorage);
};

export const setLocalStorage = (localStorageJSON) => (
    Object.entries(
        JSON.parse(localStorageJSON))
        .forEach(
            ([key, value]) => (
                getLocalStorage().setItem(
                    key,
                    JSON.stringify(value))))
);

const handleSetValue = (key, setValue) => (value) => {
    getLocalStorage().setItem(
        key,
        JSON.stringify(value));
    setValue(value);
};