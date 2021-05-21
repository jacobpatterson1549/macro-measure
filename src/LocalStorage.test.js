import { render, screen, fireEvent } from '@testing-library/react';

import { useLocalStorage, clearLocalStorage, getAllLocalStorage, setAllLocalStorage } from './LocalStorage';

describe('useLocalStorage in a mock component', () => {
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
    it('should get defaultValue', () => {
        const expected = 'test1';
        render(<MockComponent defaultValue={expected} />);
        const element = screen.getByText(expected);
        expect(element).toBeInTheDocument();
        expect(window.localStorage.getItem).toBeCalledWith(key);
    });
    it('should get the saved value', () => {
        const expected = 'test2';
        const json = `"${expected}"`;
        window.localStorage.getItem.mockReturnValue(json);
        render(<MockComponent />);
        const element = screen.getByText(expected);
        expect(element).toBeInTheDocument();
        expect(window.localStorage.getItem).toBeCalledWith(key);
    });
    it('should setItem when clicked', () => {
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
    it('should call clear on localStorage', () => {
        clearLocalStorage();
        expect(window.localStorage.clear).toBeCalled();
    });
});

describe('import/export', () => {
    const allJSON = '{"key1":"text","key2":42,"key3":{"obj":"prop"}}';
    it('should getAllLocalStorage', () => {
        window.localStorage.length = 3;
        window.localStorage.key.mockReturnValueOnce('key1').mockReturnValueOnce('key2').mockReturnValueOnce('key3');
        window.localStorage.getItem.mockReturnValueOnce('"text"').mockReturnValueOnce('42').mockReturnValueOnce('{"obj":"prop"}');
        const actual = getAllLocalStorage();
        expect(window.localStorage.key.mock.calls).toEqual([[0],[1],[2]]);
        expect(window.localStorage.getItem.mock.calls).toEqual([['key1'],['key2'],['key3']]);
        expect(actual).toEqual(allJSON);
    });
    it('should setAllLocalStorage', () => {
        const expected = [
            ['key1', '"text"'],
            ['key2', '42'],
            ['key3', '{"obj":"prop"}'],
        ];
        setAllLocalStorage(allJSON);
        expect(window.localStorage.setItem.mock.calls).toEqual(expected);
    });
});