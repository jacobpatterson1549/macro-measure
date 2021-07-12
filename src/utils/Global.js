// global objects/functions that will often need to be mocked for testing
export const isFullscreen = () => (
    !!window.document.fullscreenElement // TODO: use this
);
export const requestFullscreen = window.document.body.requestFullscreen; // TODO: use this
export const exitFullscreen = window.document.exitFullscreen; // TODO: use this
export const indexedDB = window.indexedDB;
export const localStorage = window.localStorage; // TODO: use this everywhere
export const IDBKeyRange = window.IDBKeyRange;
export const addWindowEventListener = window.addEventListener;
export const removeWindowEventListener = window.removeEventListener;
export const reloadWindow = window.location.reload;
export const geolocation = navigator.geolocation; // TODO: use this
export const isProductionEnv = () => (
    process.env.NODE_ENV = 'production'
);
export const canUseServiceWorker = () => (
    'serviceWorker' in navigator
);
export const registerServiceWorker = navigator.serviceWorker?.register;
export const isOnLine = () => (
    navigator.onLine
);
export const createObjectURL = URL.createObjectURL;
export const revokeObjectURL = URL.revokeObjectURL;
export const getCurrentDate = () => (
    new Date(
        Date.now())
        .toISOString()
        .replace(/[^\dZ]/g, '')
);