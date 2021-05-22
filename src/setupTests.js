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
    reload: jest.fn(),
    protocol: 'https:',
};
const geolocationMock = {
    watchPosition: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'location', { value: locationMock });
Object.defineProperty(global.navigator, 'geolocation', { value: geolocationMock });