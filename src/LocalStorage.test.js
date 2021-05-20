import { render, screen, fireEvent } from '@testing-library/react';

import { useLocalStorage, clearLocalStorage } from './LocalStorage';

describe('localStorage', () => {
    // these tests use the mock defined in setupTests.js
    const key = 'key';
    const MockComponent = ({
        defaultValue,
        clickValue,
    }) => {
        const [value, setValue] = useLocalStorage(key, defaultValue);
        return (
            <p onClick={() => setValue(clickValue)}>{value}</p>
        );
    };
    test('should get defaultValue', () => {
        const expected = 'test1';
        render(<MockComponent defaultValue={expected} />);
        const element = screen.getByText(expected);
        expect(element).toBeInTheDocument();
        expect(window.localStorage.getItem).toBeCalledWith(key);
    });
    test('should get the saved value', () => {
        const expected = 'test2';
        const json = `"${expected}"`;
        window.localStorage.getItem.mockReturnValue(json);
        render(<MockComponent />);
        const element = screen.getByText(expected);
        expect(element).toBeInTheDocument();
        expect(window.localStorage.getItem).toBeCalledWith(key);
    });
    test('should setItem when clicked', () => {
        const before = 'this should not be saved';
        const expected = 'test3';
        const expectedJSON = `"${expected}"`;
        render(<MockComponent defaultValue={before} clickValue={expected} />);
        const element = screen.getByText(before);
        fireEvent.click(element);
        expect(window.localStorage.setItem).toBeCalledWith(key, expectedJSON);
    });
});

describe('clearLocalStorage', () => {
    test('should call clear on localStorage', () =>{
        clearLocalStorage();
        expect(window.localStorage.clear).toBeCalled();
    });
    test('should reload the page to reload all components from defaults', () =>{
        clearLocalStorage();
        expect(window.location.reload).toBeCalled();
    });
});