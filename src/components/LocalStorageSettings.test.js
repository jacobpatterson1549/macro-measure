import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LocalStorageSettings } from './LocalStorageSettings';

import { getLocalStorageJSON, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';
import { getCurrentDate, reloadWindow, createObjectURL, revokeObjectURL } from '../utils/Global'

jest.mock('../utils/LocalStorage', () => ({
    clearLocalStorage: jest.fn(),
    getLocalStorageJSON: jest.fn(),
    setLocalStorage: jest.fn(),
}));
jest.mock('../utils/Global', () => ({
    getCurrentDate: jest.fn(),
    reloadWindow: jest.fn(),
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
}));

describe('LocalStorageSettings', () => {
    describe('clear storage', () => {
        it('should clear storage when clicked', () => {
            render(<LocalStorageSettings />);
            const clearStorageElement = screen.getByLabelText(/clear/i);
            fireEvent.click(clearStorageElement);
            expect(clearLocalStorage).toBeCalled();
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
            await waitFor(expect(getLocalStorageJSON).toBeCalled);
            expect(createObjectURL).toBeCalled();
            const exportLink = screen.getByRole('link');
            expect(exportLink.href).toMatch(expectedURL);
            expect(exportLink.download).toContain(expectedCurrentDate);
            expect(exportLink.download).toMatch(/^\S+$/); // expect link to have no spaces
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
            await waitFor(expect(getLocalStorageJSON).toBeCalled);
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