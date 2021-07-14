import { render } from 'react-dom';

import { registerSW } from './serviceWorkerRegistration';

import { App } from './components/App';

import { initDatabase } from './utils/Database'

jest.spyOn(window, 'addEventListener');
jest.mock('react-dom', () => ({
    render: jest.fn(),
}));
jest.mock('./serviceWorkerRegistration', () => ({
    registerSW: jest.fn(),
}))
jest.mock('./utils/Database', () => ({
    initDatabase: jest.fn(),
}));

describe('index', () => {
    const requireIndex = () => {
        jest.isolateModules(() => {
            require('./index')
        });
    };
    it('should not render until the window is loaded', () => {
        jest.isolateModules(() => require('./index'));
        expect(registerSW).not.toBeCalled();
        expect(initDatabase).not.toBeCalled();
        expect(render).not.toBeCalled();
    });
    it('should load sw, db, app', async () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        requireIndex();
        expect(window.addEventListener.mock.calls[0][0]).toBe('load');
        const loadFn = window.addEventListener.mock.calls[0][1];
        await loadFn();
        expect(registerSW).toBeCalled();
        expect(initDatabase).toBeCalled();
        expect(render).toHaveBeenCalledWith(<App />, rootElement);
    });
});