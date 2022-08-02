import { render } from 'react-dom';

import { registerSW } from './serviceWorkerRegistration';

import { App } from './components/App';

import { initDatabase } from './utils/Database'
import React from 'react';

jest.spyOn(window, 'addEventListener');
jest.mock('react-dom');
jest.mock('./serviceWorkerRegistration');
jest.mock('./utils/Database');

describe('index', () => {
    const requireIndex = () => {
        jest.isolateModules(() => {
            require('./index')
        });
    };
    it('should not render until the window is loaded', () => {
        requireIndex();
        expect(registerSW).not.toBeCalled();
        expect(initDatabase).not.toBeCalled();
        expect(render).not.toBeCalled();
    });
    it('should load sw, db, app', async () => {
        const mockDB = 'mock database';
        initDatabase.mockReturnValue(mockDB);
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        requireIndex();
        expect(window.addEventListener.mock.calls[0][0]).toBe('load');
        const loadFn = window.addEventListener.mock.calls[0][1];
        await loadFn();
        expect(registerSW).toBeCalled();
        expect(initDatabase).toBeCalled();
        expect(render).toBeCalled();
        const calls = render.mock.calls;
        expect(calls.length).toBe(1);
        expect(calls[0].length).toBe(2);
        expect(calls[0][0].props).toStrictEqual({db:mockDB});
        expect(calls[0][1]).toStrictEqual(rootElement);
    });
});