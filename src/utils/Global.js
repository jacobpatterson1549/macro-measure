// global objects/functions that will often need to be mocked for testing
export const isFullscreen = () => (
    !!window.document.fullscreenElement // TODO: use this
);
export const requestFullscreen = window.document.body.requestFullscreen; // TODO: use this
export const exitFullscreen = window.document.exitFullscreen; // TODO: use this
export const indexedDB = window.indexedDB;
export const localStorage = window.localStorage; // TODO: use this everywhere
export const IDBKeyRange = window.IDBKeyRange;
export const addWindowEventListener = window.addEventListener; // TODO: use this, especially in index/sw
export const removeWindowEventListener = window.removeEventListener; // TODO: use this
export const reloadLocation = window.location.reload; // TODO: use this
export const geolocation = navigator.geolocation; // TODO: use this
export const serviceWorker = navigator.serviceWorker; // TODO: use this
export const onLine = navigator.onLine; // TODO: use this
export const createObjectURL = URL.createObjectURL; // TODO: use this
export const revokeObjectURL = URL.revokeObjectURL; // TODO: use this
export const DateNow = Date.now; // TODO: use this
export const getCurrentDate = () => (
    new Date(
        Date.now())
        .toISOString()
        .replace(/[^\dZ]/g, '')
);