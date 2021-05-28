import { render, screen, fireEvent } from '@testing-library/react';

import { GPSSettings } from './GPSSettings';

describe('GPSSettings', () => {
    describe('distance unit', () => {
        it('should render value', () => {
            const distanceUnit = 'yd';
            render(<GPSSettings distanceUnit={distanceUnit} />);
            const selectElement = screen.getByLabelText(/distance unit/i);
            expect(selectElement.value).toBe(distanceUnit);
        });
        it('should set value when changed', () => {
            const distanceUnit = 'ft';
            const setDistanceUnitFn = jest.fn();
            render(<GPSSettings distanceUnit={distanceUnit} setDistanceUnit={setDistanceUnitFn} />);
            const selectElement = screen.getByLabelText(/distance unit/i);
            fireEvent.change(selectElement);
            expect(setDistanceUnitFn).toBeCalledWith(distanceUnit);
        });
    });
    describe('gps', () => {
        const values = [true, false];
        it.each(values)('should have checked state of %s', (value) => {
            render(<GPSSettings highAccuracyGPS={value} />)
            const checkboxElement = screen.getByLabelText(/GPS/i);
            expect(checkboxElement.checked).toBe(value);
        });
        it.each(values)('should flip value when checked was %s', (value) => {
            const setHighAccuracyGPSFn = jest.fn();
            render(<GPSSettings highAccuracyGPS={value} setHighAccuracyGPS={setHighAccuracyGPSFn} />);
            const checkboxElement = screen.getByLabelText(/GPS/i);
            fireEvent.click(checkboxElement);
            expect(setHighAccuracyGPSFn).toBeCalledWith(!value);
        });
    });
});