import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LocalStorageSettings, _getISO8601Digits } from './LocalStorageSettings';

import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

jest.mock('../utils/LocalStorage', () => ({
    clearLocalStorage: jest.fn(),
    getLocalStorage: jest.fn(),
    setLocalStorage: jest.fn(),
}));

describe('LocalStorageSettings', () => {
    describe('clear storage', () => {
        it('should clear storage when clicked', () => {
            render(<LocalStorageSettings />);
            const clearStorageElement = screen.getByLabelText(/clear/i);
            fireEvent.click(clearStorageElement);
            expect(clearLocalStorage).toBeCalled();
            expect(window.location.reload).toBeCalled();
        });
    });
    describe('import/export', () => {
        const allJSON = '{"groups":[{"name":"backup","items":[]}]}';
        it('should export storage when clicked', async () => {
            const expectedURL = 'some_export_url'
            const createObjectURLMock = jest.fn().mockReturnValue(expectedURL);
            Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectURLMock });
            render(<LocalStorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            await waitFor(expect(getLocalStorage).toBeCalled);
            expect(createObjectURLMock).toBeCalled();
            const exportLink = screen.getByRole('link');
            expect(exportLink.href).toMatch(expectedURL);
            expect(exportLink.textContent).toMatch(/^\S+$/); // expect link to have no spaces
        });
        it('should import storage when changed', async () => {
            const textFn = jest.fn().mockReturnValue(allJSON);
            render(<LocalStorageSettings />);
            const importElement = screen.getByLabelText(/import/i);
            fireEvent.change(importElement, {
                target: {
                    files: [{ text: textFn }],
                }
            });
            await waitFor(expect(textFn).toBeCalled);
            expect(clearLocalStorage).toBeCalled();
            expect(setLocalStorage).toBeCalledWith(allJSON);
            expect(window.location.reload).toBeCalled();
        });
    });
    describe('reload button', () => {
        it('should reload window when clicked', () => {
            render(<LocalStorageSettings />);
            const reloadButtonElement = screen.getByLabelText(/reload/i);
            fireEvent.click(reloadButtonElement);
            expect(window.location.reload).toBeCalled();
        });
    });
    describe('getISO8601Digits', () => {
        const tests = [
            ['should have contain digits and UTC (Zulu) timezone (Z)', Date.UTC(2021, 5, 1, 17, 22, 30, 554), '20210601172230554Z'],
            ['should end in Z even if date is not in GMT', Date.parse('Tue Jun 01 2021 12:36:26 GMT-0700'), '20210601193626000Z'],
            ['show always end in Z, even for the current date', new Date().getTime(), /Z$/],
        ];
        it.each(tests)('%s', (name, epochMilliseconds, expected) => {
            const date = new Date(epochMilliseconds);
            const actual = _getISO8601Digits(date);
            expect(actual).toMatch(expected);
        });
    });
});