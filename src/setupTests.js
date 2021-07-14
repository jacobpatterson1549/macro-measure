// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
};

const mockGeolocation = {
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
};

jest.mock('./utils/Global', () => ({
    isFullscreen: jest.fn(),
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    getIndexedDB: jest.fn(),
    getIDBKeyRange: jest.fn(),
    getLocalStorage: () => mockLocalStorage,
    addWindowEventListener: jest.fn(),
    removeWindowEventListener: jest.fn(),
    reloadWindow: jest.fn(),
    getGeolocation: () => mockGeolocation,
    isOnLine: jest.fn(),
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
    getCurrentDate: jest.fn(),
}));