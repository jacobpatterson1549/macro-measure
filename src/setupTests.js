// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('./utils/Global', () => ({
    isFullscreen: jest.fn(),
    requestFullscreen: jest.fn(),
    exitFullscreen: jest.fn(),
    getIndexedDB: jest.fn(),
    getIDBKeyRange: jest.fn(),
    getLocalStorage: jest.fn(),
    addWindowEventListener: jest.fn(),
    removeWindowEventListener: jest.fn(),
    reloadWindow: jest.fn(),
    getGeolocation: jest.fn(),
    isOnLine: jest.fn(),
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
    getCurrentDate: jest.fn(),
}));