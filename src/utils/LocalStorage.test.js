import { render, screen } from '@testing-library/react';

import { useLocalStorage, clear, getAll, setAll } from './LocalStorage';

import { getLocalStorage } from './Global';

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
            expect(getLocalStorage().getItem).toBeCalledWith(key);
        });
        it('should get the saved value', () => {
            const expected = 'test2';
            const json = `"${expected}"`;
            getLocalStorage().getItem.mockReturnValue(json);
            render(<MockComponent />);
            const element = screen.getByText(expected);
            expect(element).toBeInTheDocument();
            expect(getLocalStorage().getItem).toBeCalledWith(key);
        });
        it('should setItem when clicked', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            const expectedJSON = `"${expected}"`;
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            element.click();
            expect(getLocalStorage().setItem).toBeCalledWith(key, expectedJSON);
        });
        it('should setItem five times when clicked five times', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            element.click();
            element.click();
            element.click();
            element.click();
            element.click();
            expect(getLocalStorage().setItem).toBeCalledTimes(5);
        });
    });
    describe('clear', () => {
        it('should call clear on localStorage', () => {
            clear();
            expect(getLocalStorage().clear).toBeCalled();
        });
    });
    describe('import/export', () => {
        const localStorageObject = { "key1": "text", "key2": 42, "key3": { "obj": "prop" } };
        it('should getAll', () => {
            getLocalStorage().length = 3;
            getLocalStorage().key.mockReturnValueOnce('key1').mockReturnValueOnce('key2').mockReturnValueOnce('key3');
            getLocalStorage().getItem.mockReturnValueOnce('"text"').mockReturnValueOnce('42').mockReturnValueOnce('{"obj":"prop"}');
            const expected = localStorageObject;
            const actual = getAll();
            expect(getLocalStorage().key.mock.calls).toEqual([[0], [1], [2]]);
            expect(getLocalStorage().getItem.mock.calls).toEqual([['key1'], ['key2'], ['key3']]);
            expect(actual).toEqual(expected);
        });
        it('should setAll', () => {
            const expected = [
                ['key1', '"text"'],
                ['key2', '42'],
                ['key3', '{"obj":"prop"}'],
            ];
            setAll(JSON.stringify(localStorageObject));
            expect(getLocalStorage().setItem.mock.calls).toEqual(expected);
        });
    });
});