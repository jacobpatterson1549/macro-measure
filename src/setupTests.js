// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// TODO: most of these should be deleted.  Modules should reference fields in the src/utils/Global.js module, mock those all fields here
Object.defineProperties(global, {
    'localStorage': {
        value: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            key: jest.fn(),
            length: 0,
        },
        writable: true,
    },
    'location': {
        value: {
            assign: jest.fn(),
            reload: jest.fn(),
            protocol: 'https:',
            hostname: 'macro-measure.herokuapp.com',
        },
        writable: true,
    },
});