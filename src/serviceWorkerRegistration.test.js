jest.spyOn(window, 'addEventListener');

describe('register', () => {
    let oldEnv;
    beforeEach(() => {
        oldEnv = process.env.NODE_ENV;
    });
    afterEach(() => {
        process.env.NODE_ENV = oldEnv;
        jest.resetModules();
    });
    it('should NOT add listener to register service worker when NOT in navigator', () => {
        delete navigator.serviceWorker;
        require('./serviceWorkerRegistration');
        expect(window.addEventListener).not.toBeCalled();
    });
    it('should NOT add listener to register service worker when NOT in production', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'development';
        require('./serviceWorkerRegistration');
        expect(window.addEventListener).not.toBeCalled();
    });
    it('should add listener to load service worker when in navigator', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'production';
        require('./serviceWorkerRegistration');
        expect(window.addEventListener).toBeCalledTimes(1);
        expect(window.addEventListener.mock.calls[0][0]).toBe('load');
    });
    it('should register service worker when in navigator when load', () => {
        navigator.serviceWorker = { register: jest.fn() };
        process.env.NODE_ENV = 'production';
        require('./serviceWorkerRegistration');
        const loadFn = window.addEventListener.mock.calls[0][1]; // see previous test, first item is 'load'
        loadFn();
        expect(navigator.serviceWorker.register).toBeCalled();
    });
});