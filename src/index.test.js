import { render } from 'react-dom';

import { App } from './components/App';

jest.mock('react-dom', () => ({
    render: jest.fn(),
 }));
jest.spyOn(window, 'addEventListener');

describe('index', () => {
    afterEach(() => {
        jest.resetModules();
    });
    it('should register the service worker and render on the root element', () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(render).toHaveBeenCalledWith(<App />, rootElement);
    });
    describe('service worker registration', () => {
        it('should NOT add listener to register service worker when NOT in navigator', () => {
            navigator = {};
            require('./index.js');
            expect(window.addEventListener).not.toBeCalled();
        });
        it('should add listener to load service worker when in navigator', () => {
            navigator.serviceWorker = { register: jest.fn() };
            require('./index.js');
            expect(window.addEventListener).toBeCalledTimes(1);
            expect(window.addEventListener.mock.calls[0][0]).toBe('load');
        });
        it('should register service worker when in navigator when load', () => {
            navigator.serviceWorker = { register: jest.fn() };
            require('./index.js');
            const loadFn = window.addEventListener.mock.calls[0][1];
            loadFn();
            expect(navigator.serviceWorker.register).toBeCalled();
        });
    });
});