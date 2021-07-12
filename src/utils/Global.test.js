import { isFullscreen, getIndexedDB, getLocalStorage, getIDBKeyRange, getGeolocation, isOnLine, isProductionEnv, canUseServiceWorker, getCurrentDate } from './Global';

describe('Global', () => {
    Object.defineProperty(window, 'navigator', { value: {}, writable: true });
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
    })
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
        const oldLocalStorage = window.localStorage;
        const expected = 'test 3';
        window.localStorage = expected;
        const actual = getLocalStorage();
        expect(actual).toBe(expected);
        window.localStorage = oldLocalStorage;
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
        const oldOnLine = window.navigator.onLine;
        const expected = 'test 5';
        window.navigator.onLine = expected;
        const actual = isOnLine();
        expect(actual).toBe(expected);
        window.navigator.onLine = oldOnLine;
    });
    describe('isProductionEnv', () => {
        const tests = [
            [true, 'production'],
            [false, 'development'],
            [false, null],
        ];
        let oldEnv;
        beforeAll(() => oldEnv = process.env.NODE_ENV);
        afterAll(() => process.env.NODE_ENV = oldEnv);
        it.each(tests)('should return %s from isProductionEnv when process.env.NODE_ENV is %s', (expected, nodeEnv) => {
            process.env.NODE_ENV = nodeEnv;
            const actual = isProductionEnv();
            expect(actual).toBe(expected);
        });
    });
    describe('canUseServiceWorker', () => {
        const tests = [
            [true, { 'something': 1, 'serviceWorker': 2, 'other': 3 }],
            [true, { 'serviceWorker': 1 }],
            [false, { 'something': 1, 'other': 2 },],
            [false, {},], // the test fails if navigator is null, which is acceptable
        ];
        let oldNavigator;
        beforeAll(() => oldNavigator = window.navigator);
        afterAll(() => window.navigator = oldNavigator);
        it.each(tests)('should return %s from canUseServiceWorker when navigator is %s', (expected, navigator) => {
            window.navigator = navigator;
            const actual = canUseServiceWorker();
            expect(actual).toBe(expected);
        })
    })
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