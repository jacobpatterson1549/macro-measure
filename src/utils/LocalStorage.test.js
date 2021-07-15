import { getAll, setAll, clear } from './LocalStorage';

import { getLocalStorage } from './Global';

describe('LocalStorage', () => {
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
    describe('clear', () => {
        it('should call clear on localStorage', () => {
            clear();
            expect(getLocalStorage().clear).toBeCalled();
        });
    });
});