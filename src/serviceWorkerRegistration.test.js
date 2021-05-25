import * as serviceWorker from './serviceWorkerRegistration';

describe('service worker registration', () => {
    afterEach(() => {
        delete process.env.NODE_ENV;
    });
    describe('protocolCheck', () => {
        const protocolRedirectTests = [
            ['http:', 'development', 'localhost', 'http:'],
            ['http:', 'development', 'macro-measure.herokuapp.com', 'http:'],
            ['https:', 'development', 'localhost', 'https:'],
            ['http:', 'production', 'localhost', 'http:'],
            ['http:', 'production', 'macro-measure.herokuapp.com', 'https:'],
            ['https:', 'production', 'example.com', 'https:'],
            ['ftp:', 'production', 'example.com', 'https:'],
        ];
        it.each(protocolRedirectTests)('should have correct protocol: when protocol is %s, env is %s, and hostname is %s, protocol should become %s', (protocol, nodeEnv, hostname, expected) => {
            window.location.protocol = protocol;
            process.env.NODE_ENV = nodeEnv;
            window.location.hostname = hostname;
            serviceWorker.checkProtocol();
            expect(window.location.protocol).toBe(expected);
        });
    });
});