import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { StorageSettings } from './StorageSettings';

import { getAll as getAllLocalStorage, setAll as setAllLocalStorage, clear as clearLocalStorage } from '../utils/LocalStorage';
import { getAll as getAllDatabase, deleteDatabase } from '../utils/Database';
import { getCurrentDate, reloadWindow, createURL, revokeURL } from '../utils/Global'

jest.spyOn(window, 'Blob').mockImplementation();
jest.mock('../utils/LocalStorage');
jest.mock('../utils/Database', () => ({
    getAll: jest.fn().mockResolvedValue(),
    deleteDatabase: jest.fn().mockResolvedValue(),
}));

describe('StorageSettings', () => {
    describe('clear storage', () => {
        it('should clear storage when clicked', async () => {
            render(<StorageSettings />);
            const clearStorageElement = screen.getByLabelText(/clear/i);
            fireEvent.click(clearStorageElement);
            expect(clearLocalStorage).toHaveBeenCalled();
            await waitFor(deleteDatabase);
            expect(reloadWindow).toHaveBeenCalled();
        });
    });
    describe('import/export', () => {
        const allJSON = '{"groups":[{"name":"backup","items":[]}]}';
        it('should export storage when clicked', async () => {
            const expectedURL = 'some_export_url'
            const expectedCurrentDate = 'MOCK_CURRENT_DATE';
            getAllLocalStorage.mockReturnValue({ 'localStorage': true });
            getAllDatabase.mockResolvedValue({ 'database': true });
            createURL.mockReturnValue(expectedURL);
            getCurrentDate.mockReturnValue(expectedCurrentDate);
            render(<StorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            await act(async () => fireEvent.click(exportElement));
            expect(getAllLocalStorage).toHaveBeenCalled();
            await waitFor(getAllDatabase);
            expect(Blob).toHaveBeenCalledWith(['{"localStorage":true,"database":true}'], { type: 'application/json' });
            const exportLink = screen.getByRole('link');
            expect(exportLink.href).toMatch(expectedURL);
            expect(exportLink.download).toContain(expectedCurrentDate);
            expect(exportLink.download).toMatch(/^\S+$/); // expect link to have no spaces
        });
        it('should import storage when changed', async () => {
            const textFn = jest.fn().mockReturnValue(allJSON);
            render(<StorageSettings />);
            const importElement = screen.getByLabelText(/import/i);
            fireEvent.change(importElement, {
                target: {
                    files: [{ text: textFn }],
                }
            });
            await waitFor(expect(textFn).toHaveBeenCalled);
            expect(clearLocalStorage).toHaveBeenCalled();
            expect(setAllLocalStorage).toHaveBeenCalledWith(allJSON);
            expect(reloadWindow).toHaveBeenCalled();
        });
        it.skip('should revokeURL', async () => {
            // TODO: is this test needed?
            const expectedURLs = ['url1', 'url2', 'url3']
            expectedURLs.forEach((url) => createURL.mockReturnValueOnce(url))
            const { unmount } = render(<StorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            await act(async () => fireEvent.click(exportElement));
            await act(async () => fireEvent.click(exportElement));
            await act(async () => fireEvent.click(exportElement));
            expect(getAllLocalStorage).toHaveBeenCalledTimes(3);
            await waitFor(getAllDatabase);
            expect(revokeURL.mock.calls).toEqual([['url1'], ['url2']]);
            unmount();
            expect(revokeURL.mock.calls).toEqual([['url1'], ['url2'], ['url3']]);
        });
    });
    describe('reload button', () => {
        it('should reload window when clicked', () => {
            render(<StorageSettings />);
            const reloadButtonElement = screen.getByLabelText(/reload/i);
            fireEvent.click(reloadButtonElement);
            expect(reloadWindow).toHaveBeenCalled();
        });
    });
});
