import { render, screen } from '@testing-library/react';

import { useLocalStorage, clearLocalStorage, getLocalStorageJSON, setLocalStorage } from './LocalStorage';

import { deleteDatabase, getDatabaseAsObject } from './Database'
import { getLocalStorage } from './Global';

jest.mock('./Database', () => ({
    deleteDatabase: jest.fn(),
    getDatabaseAsObject: jest.fn(),
}));
jest.mock('./Global', () => ({
    getLocalStorage: jest.fn(),
}));

describe('LocalStorage', () => {
    let localStorage;
    beforeEach(() => {
        localStorage = {
            key: jest.fn(),
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        }
        getLocalStorage.mockReturnValue(localStorage);
    });
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
            expect(localStorage.getItem).toBeCalledWith(key);
        });
        it('should get the saved value', () => {
            const expected = 'test2';
            const json = `"${expected}"`;
            localStorage.getItem.mockReturnValue(json);
            render(<MockComponent />);
            const element = screen.getByText(expected);
            expect(element).toBeInTheDocument();
            expect(localStorage.getItem).toBeCalledWith(key);
        });
        it('should setItem when clicked', () => {
            const before = 'this should not be saved';
            const expected = 'test3';
            const expectedJSON = `"${expected}"`;
            render(<MockComponent defaultValue={before} clickValue={expected} />);
            const element = screen.getByText(before);
            element.click();
            expect(localStorage.setItem).toBeCalledWith(key, expectedJSON);
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
            expect(localStorage.setItem).toBeCalledTimes(5);
        });
    });
    describe('clearLocalStorage', () => {
        it('should call clear on localStorage', () => {
            clearLocalStorage();
            expect(localStorage.clear).toBeCalled();
        });
        it('should delete the database', () => {
            clearLocalStorage();
            expect(deleteDatabase).toBeCalled();
        });
    });
    describe('import/export', () => {
        const localStorageJSON = '{"key1":"text","key2":42,"key3":{"obj":"prop"},"dbData":true}';
        it('should getAllLocalStorage', async () => {
            localStorage.length = 3;
            localStorage.key.mockReturnValueOnce('key1').mockReturnValueOnce('key2').mockReturnValueOnce('key3');
            localStorage.getItem.mockReturnValueOnce('"text"').mockReturnValueOnce('42').mockReturnValueOnce('{"obj":"prop"}');
            getDatabaseAsObject.mockReturnValue({ dbData: true})
            const expected = localStorageJSON;
            const actual = await getLocalStorageJSON();
            expect(localStorage.key.mock.calls).toEqual([[0], [1], [2]]);
            expect(localStorage.getItem.mock.calls).toEqual([['key1'], ['key2'], ['key3']]);
            expect(actual).toEqual(expected);
        });
        it('should setAllLocalStorage', () => {
            const expected = [
                ['key1', '"text"'],
                ['key2', '42'],
                ['key3', '{"obj":"prop"}'],
                ['dbData', 'true'],
            ];
            setLocalStorage(localStorageJSON);
            expect(localStorage.setItem.mock.calls).toEqual(expected);
        });
    });
});