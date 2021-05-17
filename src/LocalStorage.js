import { useState, useEffect } from 'react';

const storage = window.localStorage;

export const useLocalStorage = (key, defaultValue) => {

    const [state, setState] = useState(() => {
        const storageValue = storage.getItem(key);
        return storageValue === null
            ? defaultValue
            : JSON.parse(storageValue);
    });

    useEffect(() => {
        storage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}

export const clearLocalStorage = () => {
    storage.clear();
    window.location.reload(); // force all states to be refreshed
}