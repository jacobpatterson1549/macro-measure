import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorkerRegistration';

jest.mock('react-dom', () => ({ render: jest.fn() }));
jest.mock('./serviceWorkerRegistration', () => ({
    register: jest.fn(),
    checkProtocol: jest.fn(),
}));

describe('index', () => {
    afterEach(() => {
        jest.resetModules();
    });
    it('should register the service worker and render on the root element', () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(serviceWorker.checkProtocol).toBeCalled();
        expect(serviceWorker.register).toBeCalled();
        expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), rootElement);
    });
});