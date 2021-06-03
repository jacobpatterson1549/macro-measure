import { render, screen, fireEvent } from '@testing-library/react';

import { useLocalStorage, clearLocalStorage, getLocalStorage, setLocalStorage } from './LocalStorage';

describe('LocalStorage', () => {
    describe('useLocalStorage', () => {
        // these tests use the mock defined in setupTests.js
        const key = 'key';
        const MockComponent = ({
            defaultValue,
            clickValue,
        }) => {
            const [value, setValue] = useLocalStorage(key, defaultValue);
            const handleSetValue = () => () => setValue(clickValue)
            return (
                <p onClick={handleSetValue()}>{value}</p>
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
        it('should setItem five times when clicked five times', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            const expectedJSON = `"${expected}"`;
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            fireEvent.click(element);
            fireEvent.click(element);
            fireEvent.click(element);
            fireEvent.click(element);
            fireEvent.click(element);
            expect(window.localStorage.setItem).toBeCalledTimes(5);
        });
    });
    describe('clearLocalStorage', () => {
        it('should call clear on localStorage', () => {
            clearLocalStorage();
            expect(window.localStorage.clear).toBeCalled();
        });
    });
    describe('import/export', () => {
        const localStorageJSON = '{"key1":"text","key2":42,"key3":{"obj":"prop"}}';
        it('should getAllLocalStorage', () => {
            window.localStorage.length = 3;
            window.localStorage.key.mockReturnValueOnce('key1').mockReturnValueOnce('key2').mockReturnValueOnce('key3');
            window.localStorage.getItem.mockReturnValueOnce('"text"').mockReturnValueOnce('42').mockReturnValueOnce('{"obj":"prop"}');
            const actual = getLocalStorage();
            expect(window.localStorage.key.mock.calls).toEqual([[0], [1], [2]]);
            expect(window.localStorage.getItem.mock.calls).toEqual([['key1'], ['key2'], ['key3']]);
            expect(actual).toEqual(localStorageJSON);
        });
        it('should setAllLocalStorage', () => {
            const expected = [
                ['key1', '"text"'],
                ['key2', '42'],
                ['key3', '{"obj":"prop"}'],
            ];
            setLocalStorage(localStorageJSON);
            expect(window.localStorage.setItem.mock.calls).toEqual(expected);
        });
    });
});