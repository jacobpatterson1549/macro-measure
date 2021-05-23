import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { LocalStorageSettings } from './LocalStorageSettings';
import { getLocalStorage, setLocalStorage, clearLocalStorage } from '../utils/LocalStorage';

jest.mock('../utils/LocalStorage', () => ({
    clearLocalStorage: jest.fn(),
    getLocalStorage: jest.fn(),
    setLocalStorage: jest.fn(),
}));

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
    it('should export storage when clicked', () => {
        const createObjectURLMock = jest.fn();
        Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectURLMock });
        render(<LocalStorageSettings />);
        const exportElement = screen.getByLabelText(/export/i);
        fireEvent.click(exportElement);
        expect(getLocalStorage).toBeCalled();
        expect(createObjectURLMock).toBeCalled();
    });
    it('should import storage when changed', async () => {
        const textFn = jest.fn().mockResolvedValue(allJSON);
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