// global objects/functions that will often need to be mocked for testing
export const isFullscreen = () => !!window.document.fullscreenElement;
export const requestFullscreen = window.document.body.requestFullscreen;
export const exitFullscreen = window.document.exitFullscreen;
export const getElementById = window.document.getElementById;
export const indexedDB = window.indexedDB;
export const IDBKeyRange = window.IDBKeyRange;
export const getLocalStorage = () => window.localStorage;
export const addWindowEventListener = window.addEventListener;
export const removeWindowEventListener = window.removeEventListener;
export const reloadWindow = window.location.reload;
export const getGeolocation = () => navigator.geolocation;
export const isProductionEnv = () => process.env.NODE_ENV = 'production';
export const canUseServiceWorker = () => 'serviceWorker' in navigator;
export const registerServiceWorker = navigator.serviceWorker?.register;
export const isOnLine = () => navigator.onLine;
export const createObjectURL = URL.createObjectURL;
export const revokeObjectURL = URL.revokeObjectURL;
export const getCurrentDate = () => (
    new Date(
        Date.now())
        .toISOString()
        .replace(/[^\dZ]/g, '')
);