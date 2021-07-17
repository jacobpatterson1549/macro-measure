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
        const highAccuracyGPSValues = [true, false];
        it.each(highAccuracyGPSValues)('should have checked state of %s', (expected) => {
            render(<GPSSettings highAccuracyGPS={expected} />)
            const checkboxElement = screen.getByLabelText(/GPS/i);
            expect(checkboxElement.checked).toBe(expected);
        });
        it.each(highAccuracyGPSValues)('should flip value when checked was %s', (expected) => {
            const setHighAccuracyGPSFn = jest.fn();
            render(<GPSSettings highAccuracyGPS={expected} setHighAccuracyGPS={setHighAccuracyGPSFn} />);
            const checkboxElement = screen.getByLabelText(/GPS/i);
            fireEvent.click(checkboxElement);
            expect(setHighAccuracyGPSFn).toBeCalledWith(!expected);
        });
    });
});