import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('index', () => {
    afterEach(() => {
        jest.resetModules();
    });
    it('should register the service worker and render on the root element', () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), rootElement);
    });
});