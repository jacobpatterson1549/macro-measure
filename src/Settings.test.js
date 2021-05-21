import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Settings } from './Settings';

describe('distance unit', () => {
    it('should render value', () => {
        const distanceUnit = 'yd';
        render(<Settings distanceUnit={distanceUnit} />);
        const selectElement = screen.getByLabelText(/distance unit/i);
        expect(selectElement.value).toBe(distanceUnit);
    });
    it('should set value when changed', () => {
        const distanceUnit = 'ft';
        const setDistanceUnitFn = jest.fn();
        render(<Settings distanceUnit={distanceUnit} setDistanceUnit={setDistanceUnitFn} />);
        const selectElement = screen.getByLabelText(/distance unit/i);
        fireEvent.change(selectElement);
        expect(setDistanceUnitFn).toBeCalledWith(distanceUnit);
    });
});

describe('gps', () => {
    const values = [true, false];
    test.each(values)('should have checked state of %s', (value) => {
        render(<Settings highAccuracyGPS={value} />)
        const checkboxElement = screen.getByLabelText(/GPS/i);
        expect(checkboxElement.checked).toBe(value);
    });
    test.each(values)('should flip value when checked was %s', (value) => {
        const setHighAccuracyGPSFn = jest.fn();
        render(<Settings highAccuracyGPS={value} setHighAccuracyGPS={setHighAccuracyGPSFn} />)
        const checkboxElement = screen.getByLabelText(/GPS/i);
        fireEvent.click(checkboxElement);
        expect(setHighAccuracyGPSFn).toBeCalledWith(!value);
    });
});

describe('clear storage', () => {
    it('should clear storage when clicked', () => {
        const clearStorageFn = jest.fn();
        render(<Settings clearStorage={clearStorageFn} />);
        const clearStorageElement = screen.getByLabelText(/clear/i);
        fireEvent.click(clearStorageElement);
        expect(clearStorageFn).toBeCalled();
        expect(window.location.reload).toBeCalled();
    });
});

describe('import/export', () => {
    const allJSON = '{"groups":[{"name":"backup","items":[]}]}';
    it('should export storage when clicked', () => {
        const getStorageFn = jest.fn().mockReturnValue(allJSON);
        const createObjectURLMock = jest.fn();
        Object.defineProperty(global.URL, 'createObjectURL', { value: createObjectURLMock });
        render(<Settings getStorage={getStorageFn} />);
        const exportElement = screen.getByLabelText(/export/i);
        fireEvent.click(exportElement);
        expect(getStorageFn).toBeCalled();
        expect(createObjectURLMock).toBeCalled();
    });
    it('should import storage when changed', async () => {
        const clearStorageFn = jest.fn();
        const setStorageFn = jest.fn();
        const textFn = jest.fn().mockResolvedValue(allJSON);
        render(<Settings clearStorage={clearStorageFn} setStorage={setStorageFn} />);
        const importElement = screen.getByLabelText(/import/i);
        fireEvent.change(importElement, {
            target: {
                files: [{text: textFn}],
            }
        });
        await waitFor(expect(textFn).toBeCalled);
        expect(clearStorageFn).toBeCalled();
        expect(setStorageFn).toBeCalledWith(allJSON);
        expect(window.location.reload).toBeCalled();
    });
});