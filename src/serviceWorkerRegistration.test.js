import { registerSW } from './serviceWorkerRegistration';

jest.spyOn(window, 'addEventListener');
jest.mock('./utils/Global', () => ({
    canUseServiceWorker: jest.fn(),
    registerServiceWorker: jest.fn(),
    isProductionEnv: jest.fn(),
}));

describe('register', () => {
    let oldEnv;
    let oldNavigator
    beforeEach(() => {
        oldEnv = process.env.NODE_ENV;
        oldNavigator = window.navigator;
    });
    afterEach(() => {
        process.env.NODE_ENV = oldEnv;
        window.navigator = oldNavigator;
    });
    it('should NOT add listener to register service worker when NOT in navigator', () => {
        delete navigator.serviceWorker;
        expect(registerSW).not.toThrow();
    });
    it('should NOT add listener to register service worker when NOT in production', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'development';
        registerSW();
        expect(navigator.serviceWorker.register).not.toBeCalled();
    });
    it('should register service worker', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'production';
        registerSW();
        expect(navigator.serviceWorker.register).toBeCalled();
    });
});