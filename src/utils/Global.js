// global objects/functions that will often need to be mocked for testing
export const isFullscreen = () => !!window.document.fullscreenElement;
export const requestFullscreen = () => window.document.body.requestFullscreen();
export const exitFullscreen = () => window.document.exitFullscreen();
export const getIndexedDB = () => window.indexedDB;
export const getIDBKeyRange = () => window.IDBKeyRange;
export const getLocalStorage = () => window.localStorage;
export const addWindowEventListener = window.addEventListener;
export const removeWindowEventListener = window.removeEventListener;
export const reloadWindow = () => window.location.reload();
export const getGeolocation = () => window.navigator.geolocation;
export const isOnLine = () => window.navigator.onLine;
export const createObjectURL = URL.createObjectURL;
export const revokeObjectURL = URL.revokeObjectURL;
export const getCurrentDate = () => (
    new Date(
        Date.now())
        .toISOString()
        .replace(/[^\dZ]/g, '')
);