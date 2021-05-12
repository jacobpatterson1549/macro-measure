import { render, screen, fireEvent } from '@testing-library/react';

import { Settings } from './Settings'

describe('distance unit', () => {
    test('value', () => {
        const distanceUnit = 'yd';
        render(<Settings distanceUnit={distanceUnit} />);
        const selectElement = screen.getByLabelText(/distance unit/i);
        expect(selectElement.value).toBe(distanceUnit);
    });
    test('onClick', () => {
        const distanceUnit = 'ft';
        const setDistanceUnitFn = jest.fn()
        render(<Settings distanceUnit={distanceUnit} setDistanceUnit={setDistanceUnitFn} />);
        const selectElement = screen.getByLabelText(/distance unit/i);
        fireEvent.change(selectElement)
        expect(setDistanceUnitFn).toBeCalledWith(distanceUnit);
    });
});

describe('clear storage', () => {
    test('onClick', () => {
        const clearStorageFn = jest.fn();
        render(<Settings clearStorage={clearStorageFn} />);
        const clearStorageElement = screen.getByLabelText(/clear/i);
        fireEvent.click(clearStorageElement);
        expect(clearStorageFn).toBeCalled();
    });
});