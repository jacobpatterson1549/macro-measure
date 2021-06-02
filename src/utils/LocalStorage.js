import { useState, useEffect } from 'react';

const storage = window.localStorage;

export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        const storageValue = storage.getItem(key);
        return (storageValue)
            ? JSON.parse(storageValue)
            : defaultValue;
    });
    useEffect(() => {
        const valueJSON = JSON.stringify(value);
        storage.setItem(key, valueJSON);
    }, [key, value]);
    return [value, setValue];
}

export const clearLocalStorage = () => {
    storage.clear();
}

export const getLocalStorage = () => {
    const all = {};
    for (let i = 0; i < storage.length; i++) {
        const key = localStorage.key(i);
        const value = storage.getItem(key);
        const valueJSON = JSON.parse(value);
        all[key] = valueJSON;
    }
    const localStorageJSON = JSON.stringify(all);
    return localStorageJSON;
};

export const setLocalStorage = (localStorageJSON) => {
    const all = JSON.parse(localStorageJSON);
    const allEntries = Object.entries(all);
    allEntries.forEach(([key, value]) => {
        const valueJSON = JSON.stringify(value);
        localStorage.setItem(key, valueJSON);
    });
};