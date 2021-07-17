import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { StorageSettings } from './StorageSettings';

import { getAll as getAllLocalStorage, setAll as setAllLocalStorage, clear as clearLocalStorage } from '../utils/LocalStorage';
import { getAll as getAllDatabase, deleteDatabase } from '../utils/Database';
import { getCurrentDate, reloadWindow, createObjectURL, revokeObjectURL, getLocalStorage } from '../utils/Global'

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
            expect(clearLocalStorage).toBeCalled();
            await waitFor(deleteDatabase);
            expect(reloadWindow).toBeCalled();
        });
    });
    describe('import/export', () => {
        const allJSON = '{"groups":[{"name":"backup","items":[]}]}';
        it('should export storage when clicked', async () => {
            const expectedURL = 'some_export_url'
            const expectedCurrentDate = 'MOCK_CURRENT_DATE';
            getAllLocalStorage.mockReturnValue({ 'localStorage': true });
            getAllDatabase.mockResolvedValue({ 'database': true });
            createObjectURL.mockReturnValue(expectedURL);
            getCurrentDate.mockReturnValue(expectedCurrentDate);
            render(<StorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            expect(getAllLocalStorage).toBeCalled();
            await waitFor(getAllDatabase);
            expect(Blob).toBeCalledWith(['{"localStorage":true,"database":true}'], { type: 'application/json' });
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
            await waitFor(expect(textFn).toBeCalled);
            expect(clearLocalStorage).toBeCalled();
            expect(setAllLocalStorage).toBeCalledWith(allJSON);
            expect(reloadWindow).toBeCalled();
        });
        it('should revokeObjectURL', async () => {
            const expectedURLs = ['url1', 'url2', 'url3']
            expectedURLs.forEach((url) => createObjectURL.mockReturnValueOnce(url))
            const { unmount } = render(<StorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            fireEvent.click(exportElement);
            fireEvent.click(exportElement);
            expect(getAllLocalStorage).toBeCalledTimes(3);
            await waitFor(getAllDatabase);
            expect(revokeObjectURL.mock.calls).toEqual([['url1'], ['url2']]);
            unmount();
            expect(revokeObjectURL.mock.calls).toEqual([['url1'], ['url2'], ['url3']]);
        });
    });
    describe('reload button', () => {
        it('should reload window when clicked', () => {
            render(<StorageSettings />);
            const reloadButtonElement = screen.getByLabelText(/reload/i);
            fireEvent.click(reloadButtonElement);
            expect(reloadWindow).toBeCalled();
        });
    });
});