// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { getIndexedDB, getIDBKeyRange, getLocalStorage, getGeolocation } from './utils/Global';

const mockIDBKeyRangeObj = (lower, upper, lowerOpen, upperOpen) => { lower, upper, lowerOpen, upperOpen };

jest.mock('./utils/Global');

beforeEach(() => {
    getIDBKeyRange.mockReturnValue({
        only: (z) => mockIDBKeyRangeObj(z, z, false, false),
        bound: (x, y) => mockIDBKeyRangeObj(x, y, false, false),
    })
    getIndexedDB.mockReturnValue({
        open: jest.fn(),
        deleteDatabase: jest.fn(),
    });
    getLocalStorage.mockReturnValue({
        key: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
    });
    getGeolocation.mockReturnValue({
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
    });
});