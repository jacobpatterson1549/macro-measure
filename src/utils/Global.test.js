jest.unmock('./Global');
import { isFullscreen, requestFullscreen, exitFullscreen, getIndexedDB, getLocalStorage, getIDBKeyRange, reloadWindow, getGeolocation, isOnLine, createURL, revokeURL, getCurrentDate } from './Global';

describe('Global', () => {
    describe('isFullscreen', () => {
        const isFullscreenTests = [
            [{}, true],
            [null, false],
        ];
        let oldFullscreenElement;
        beforeAll(() => oldFullscreenElement = window.document.fullscreenElement);
        afterAll(() => window.document.fullscreenElement = oldFullscreenElement);
        it.each(isFullscreenTests)('should cast fullscreenElement of the document (%s) as a bool (%s)', (fullscreenElement, expected) => {
            window.document.fullscreenElement = fullscreenElement;
            const actual = isFullscreen();
            expect(actual).toBe(expected);
        });
    });
    it('should request fullscreen on the document body', () => {
        const oldRequestFullscreen = window.document.body.requestFullscreen;
        delete window.document.body;
        window.document.body.requestFullscreen =  jest.fn();
        requestFullscreen();
        expect(window.document.body.requestFullscreen).toBeCalled();
        window.document.body.requestFullscreen = oldRequestFullscreen;
    });
    it('should exit fullscreen', () => {
        const oldExitFullscreen = window.document.exitFullscreen;
        window.document.exitFullscreen = jest.fn();
        exitFullscreen();
        expect(window.document.exitFullscreen).toBeCalled();
        window.document.exitFullscreen = oldExitFullscreen;
    });
    it('should return indexedDB', () => {
        const oldIndexedDB = window.indexedDB;
        const expected = 'test 1';
        window.indexedDB = expected;
        const actual = getIndexedDB();
        expect(actual).toBe(expected);
        window.indexedDB = oldIndexedDB;
    });
    it('should return IDBKeyRange', () => {
        const oldIDBKeyRange = window.IDBKeyRange;
        const expected = 'test 2';
        window.IDBKeyRange = expected;
        const actual = getIDBKeyRange();
        expect(actual).toBe(expected);
        window.IDBKeyRange = oldIDBKeyRange;
    });
    it('should return localStorage', () => {
        Object.defineProperty(window, 'localStorage', { value: {}, writable: true });
        const oldLocalStorage = window.localStorage;
        const expected = 'test 3';
        window.localStorage = expected;
        const actual = getLocalStorage();
        expect(actual).toBe(expected);
        window.localStorage = oldLocalStorage;
    });
    it('should reload the window', () => {
        const oldGo = window.history.go;
        delete window.history.go;
        window.history.go = jest.fn();
        reloadWindow();
        expect(window.history.go).toBeCalledTimes(1);
        window.history.go = oldGo;
    });
    it('should return geolocation', () => {
        const oldGeolocation = window.navigator.geolocation;
        const expected = 'test 4';
        window.navigator.geolocation = expected;
        const actual = getGeolocation();
        expect(actual).toBe(expected);
        window.navigator.geolocation = oldGeolocation;
    });
    it('should return onLine', () => {
        Object.defineProperty(window, 'navigator', { value: {}, writable: true });
        const oldOnLine = window.navigator.onLine;
        const expected = 'test 5';
        window.navigator.onLine = expected;
        const actual = isOnLine();
        expect(actual).toBe(expected);
        window.navigator.onLine = oldOnLine;
    });
    it('should create a URL for an object', () => {
        const oldCreateObjectURL = window.URL.createObjectURL;
        window.URL.createObjectURL = jest.fn();
        const expected = 'test 6';
        createURL(expected);
        expect(window.URL.createObjectURL).toBeCalledWith(expected);
        window.URL.createObjectURL = oldCreateObjectURL;
    });
    it('should revoke a URL for an object', () => {
        const oldRevokeObjectURL = window.URL.revokeObjectURL;
        window.URL.revokeObjectURL = jest.fn();
        const expected = 'test 7';
        revokeURL(expected);
        expect(window.URL.revokeObjectURL).toBeCalledWith(expected);
        window.URL.revokeObjectURL = oldRevokeObjectURL;
    });
    describe('getCurrentDate', () => {
        const getCurrentDateTests = [
            ['should have contain digits and UTC (Zulu) timezone (Z)', Date.UTC(2021, 5, 1, 17, 22, 30, 554), '20210601172230554Z'],
            ['should end in Z even if date is not in GMT', Date.parse('Tue Jun 01 2021 12:36:26 GMT-0700'), '20210601193626000Z'],
            ['show always end in Z, even for the current date', new Date().getTime(), '\\d*Z'],
        ];
        it.each(getCurrentDateTests)('%s', (name, epochMilliseconds, expected) => {
            Date.now = jest.fn().mockReturnValue(epochMilliseconds);
            const actual = getCurrentDate();
            const re = new RegExp(`^${expected}$`);
            expect(actual).toMatch(re);
        });
    });
});