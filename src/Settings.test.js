import { render, screen, fireEvent } from '@testing-library/react';

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
        render(<Settings highAccuracyGPS={value} setHighAccuracyGPS={setHighAccuracyGPSFn} />);
        const checkboxElement = screen.getByLabelText(/GPS/i);
        fireEvent.click(checkboxElement);
        expect(setHighAccuracyGPSFn).toBeCalledWith(!value);
    });
});

it('should have local storage settings', () => {
    render(<Settings />)
    const element = screen.getByRole('group', { name: 'LocalStorage Settings' });
    expect(element).toBeInTheDocument()
});