import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('index', () => {
    it('should render on the root element', () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), rootElement);
    });
});