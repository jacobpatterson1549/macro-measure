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

export const getAllLocalStorage = () => {
    const all = {};
    for (let i = 0; i < storage.length; i++) {
        const key = localStorage.key(i);
        const value = storage.getItem(key);
        const valueJSON = JSON.parse(value);
        all[key] = valueJSON;
    }
    const allJSON = JSON.stringify(all);
    return allJSON;
};

export const setAllLocalStorage = (allJSON) => {
    const all = JSON.parse(allJSON);
    const allEntries = Object.entries(all);
    allEntries.forEach(([key, value]) => {
        const valueJSON = JSON.stringify(value);
        localStorage.setItem(key, valueJSON);
    });
};