import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

describe('index', () => {
    afterEach(() => {
        jest.resetModules();
    });
    it('should render on the root element', () => {
        const rootElement = document.createElement('div');
        rootElement.setAttribute('id', 'root');
        document.body.appendChild(rootElement);
        require('./index.js');
        expect(ReactDOM.render).toHaveBeenCalledWith(expect.anything(), rootElement);
    });
    describe('window.location.protocol', () => {
        it.each(['http:', 'https:', 'ftp:'])('should redirect to https when protocol is %s', (protocol) => {
            window.location.protocol = protocol;
            require('./index.js');
            expect(window.location.protocol).toBe('https:');
        });
    });
});