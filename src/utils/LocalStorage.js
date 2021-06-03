import { useState } from 'react';

const storage = window.localStorage;

export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => (
        JSON.parse(
            storage.getItem(key)
            || JSON.stringify(defaultValue))
    ));
    return [value, handleSetValue(key, setValue)];
};

export const clearLocalStorage = () => (
    storage.clear()
);

export const getLocalStorage = () => (
    JSON.stringify(
        Object.fromEntries(
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
                .entries()))
);

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