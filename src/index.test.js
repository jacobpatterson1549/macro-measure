import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('index', () => {
    it('should redirect to https and render on the root element', () => {
        window.location.protocol = 'http:';
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(window.location.protocol).toBe('https:');
        expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), rootElement);
    });
});