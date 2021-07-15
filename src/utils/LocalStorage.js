import { getLocalStorage } from './Global';

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

export const clear = () => (
    getLocalStorage().clear()
);