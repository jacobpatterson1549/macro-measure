import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LocalStorageSettings } from './LocalStorageSettings';

import { getAll as getAllLocalStorage, setAll as setAllLocalStorage, clear as clearLocalStorage } from '../utils/LocalStorage';
import { getAll as getAllDatabase, deleteDatabase } from '../utils/Database';
import { getCurrentDate, reloadWindow, createObjectURL, revokeObjectURL } from '../utils/Global'

jest.mock('../utils/LocalStorage', () => ({
    getAll: jest.fn(),
    setAll: jest.fn(),
    clear: jest.fn(),
}));
jest.mock('../utils/Database', () => ({
    getAll: jest.fn().mockResolvedValue(),
    deleteDatabase: jest.fn().mockResolvedValue(),
}));

describe('LocalStorageSettings', () => {
    describe('clear storage', () => {
        it('should clear storage when clicked', async () => {
            render(<LocalStorageSettings />);
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
            createObjectURL.mockReturnValue(expectedURL);
            getCurrentDate.mockReturnValue(expectedCurrentDate);
            render(<LocalStorageSettings />);
            const exportElement = screen.getByLabelText(/export/i);
            fireEvent.click(exportElement);
            expect(getAllLocalStorage).toBeCalled();
            await waitFor(getAllDatabase);
            expect(createObjectURL).toBeCalled();
            const exportLink = screen.getByRole('link');
            expect(exportLink.href).toMatch(expectedURL);
            expect(exportLink.download).toContain(expectedCurrentDate);
            expect(exportLink.download).toMatch(/^\S+$/); // expect link to have no spaces
        });
        // TODO: test combination of exported localStorage/database
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
            expect(setAllLocalStorage).toBeCalledWith(allJSON);
            expect(reloadWindow).toBeCalled();
        });
        it('should revokeObjectURL', async () => {
            const expectedURLs = ['url1', 'url2', 'url3']
            expectedURLs.forEach((url) => createObjectURL.mockReturnValueOnce(url))
            const { unmount } = render(<LocalStorageSettings />);
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
            render(<LocalStorageSettings />);
            const reloadButtonElement = screen.getByLabelText(/reload/i);
            fireEvent.click(reloadButtonElement);
            expect(reloadWindow).toBeCalled();
        });
    });
});