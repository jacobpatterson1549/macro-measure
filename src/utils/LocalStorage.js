import { useState } from 'react';

import { deleteDatabase, getDatabaseJSON } from './Database';

const storage = window.localStorage;

export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => (
        JSON.parse(
            storage.getItem(key)
            || JSON.stringify(defaultValue))
    ));
    return [value, handleSetValue(key, setValue)];
};

export const clearLocalStorage = async () => {
    storage.clear();
    // TODO add another button to clear storage, but not database (this might fix some problems)
    await deleteDatabase();
};

export const getLocalStorage = async () => {
    const ls =  Object.fromEntries(
        Array.from(Array(storage.length).keys()) // [0 .. storage.length)
            .map(
                (i) => (
                    storage.key(i)))
            .reduce(
                (map, key) => (
                    map.set(
                        key,
                        JSON.parse(storage.getItem(key)))),
                new Map())
            .entries());
    const db = await getDatabaseJSON();
    const combinedStorage = Object.assign(ls, db);
    return JSON.stringify(combinedStorage);
};

export const setLocalStorage = (localStorageJSON) => (
    Object.entries(
        JSON.parse(localStorageJSON))
        .forEach(
            ([key, value]) => (
                storage.setItem(
                    key,
                    JSON.stringify(value))))
);

const handleSetValue = (key, setValue) => (value) => {
    storage.setItem(
        key,
        JSON.stringify(value));
    setValue(value);
};