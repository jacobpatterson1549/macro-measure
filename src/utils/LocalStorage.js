import { useState } from 'react';

import { getLocalStorage } from './Global';

// TODO: move this to src/hooks
export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => (
        JSON.parse(
            getLocalStorage().getItem(key)
            || JSON.stringify(defaultValue))
    ));
    return [value, handleSetValue(key, setValue)];
};

export const clear = () => {
    getLocalStorage().clear();
};

export const getAll = () => (
    Object.fromEntries(
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
            .entries())
);

export const setAll = (localStorageJSON) => (
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