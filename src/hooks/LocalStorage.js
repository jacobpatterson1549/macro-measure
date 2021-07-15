import { useState } from 'react';

import { getLocalStorage } from '../utils/Global';

export const useLocalStorage = (key, defaultValue) => {
    const [value, setValue] = useState(() => (
        JSON.parse(
            getLocalStorage().getItem(key)
            || JSON.stringify(defaultValue))
    ));
    return [value, handleSetValue(key, setValue)];
};

const handleSetValue = (key, setValue) => (value) => {
    getLocalStorage().setItem(
        key,
        JSON.stringify(value));
    setValue(value);
};