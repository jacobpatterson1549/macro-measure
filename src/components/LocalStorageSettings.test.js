import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LocalStorageSettings } from './LocalStorageSettings';

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
        beforeAll(() => {
            Object.defineProperties(URL, {
                createObjectURL: { value: jest.fn() },
                revokeObjectURL: { value: jest.fn() },
            });
        });
        const allJSON = '{"groups":[{"name":"backup","items":[]}]}';
        it('should export storage when clicked', async () => {
            const expectedURL = 'some_export_url'
            URL.createObjectURL.mockReturnValue(expectedURL);
            render(<LocalStorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            await waitFor(expect(getLocalStorage).toBeCalled);
            expect(URL.createObjectURL).toBeCalled();
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
        it('should revokeObjectURL', async () => {
            const expectedURLs = ['url1', 'url2', 'url3']
            expectedURLs.forEach((url) => URL.createObjectURL.mockReturnValueOnce(url))
            const { unmount } = render(<LocalStorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            fireEvent.click(exportElement);
            fireEvent.click(exportElement);
            await waitFor(expect(getLocalStorage).toBeCalled);
            expect(URL.revokeObjectURL.mock.calls).toEqual([['url1'], ['url2']]);
            unmount();
            expect(URL.revokeObjectURL.mock.calls).toEqual([['url1'], ['url2'], ['url3']]);
        });
        describe('exportLink filename', () => {
            const tests = [
                ['should have contain digits and UTC (Zulu) timezone (Z)', Date.UTC(2021, 5, 1, 17, 22, 30, 554), '20210601172230554Z'],
                ['should end in Z even if date is not in GMT', Date.parse('Tue Jun 01 2021 12:36:26 GMT-0700'), '20210601193626000Z'],
                ['show always end in Z, even for the current date', new Date().getTime(), 'Z'],
            ];
            it.each(tests)('%s', async (name, epochMilliseconds, expected) => {
                Date.now = jest.fn().mockReturnValue(epochMilliseconds);
                URL.createObjectURL.mockReturnValue('any_url');
                render(<LocalStorageSettings />);
                const exportElement = screen.getByLabelText(/export/i);
                fireEvent.click(exportElement);
                const element = await waitFor(() => screen.getByRole('link'));
                const actual = element.download;
                expect(actual).toContain(expected);
            });
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
});