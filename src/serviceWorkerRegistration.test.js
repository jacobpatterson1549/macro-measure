jest.spyOn(window, 'addEventListener');

import { registerSW } from './serviceWorkerRegistration';

describe('register', () => {
    let oldEnv;
    beforeEach(() => {
        oldEnv = process.env.NODE_ENV;
        navigator.serviceWorker = { register: jest.fn() };
    });
    afterEach(() => {
        process.env.NODE_ENV = oldEnv;
        jest.resetModules();
    });
    it('should NOT register service worker when NOT in navigator', () => {
        delete navigator.serviceWorker;
        process.env.NODE_ENV = 'production';
        expect(registerSW).not.toThrow();
    });
    it('should NOT register service worker when NOT in production', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'development';
        registerSW()
        expect(navigator.serviceWorker.register).not.toBeCalled();
    });
    it('should register service worker when in production', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'production';
        registerSW();
        expect(navigator.serviceWorker.register).toBeCalled();
    });
});