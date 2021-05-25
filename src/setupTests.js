// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    key: jest.fn(),
    length: 0,
};
const locationMock = {
    assign: jest.fn(),
    reload: jest.fn(),
    protocol: 'https:',
};
const geolocationMock = {
    watchPosition: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'location', { value: locationMock, writable: true });
Object.defineProperty(global.navigator, 'geolocation', { value: geolocationMock });
Object.defineProperty(global.navigator, 'onLine', { value: true, writable: true });