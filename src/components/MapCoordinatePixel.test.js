import { render, screen, fireEvent } from '@testing-library/react';

import { MapCoordinatePixel } from './MapCoordinatePixel';

describe('MapCoordinatePixel', () => {
    describe('coordinate', () => { // these tests are very similar to the pixel tests
        it('should display value', () => {
            render(<MapCoordinatePixel
                    coordinateName="latitude(N)"
                    coordinateValue="51.4934"
                />);
            const element = screen.getByRole('spinbutton', { name: 'latitude(N)'});
            expect(element.value).toBe('51.4934')
        });
        const validationTests = [
            [true, ''],
            [false, expect.stringMatching(/.*/)], // any string of nonzero length
        ];
        it.each(validationTests)('should set value and have proper validity when validation function returns %s',
            (expectedValidationResult, expectedValidationMessage) => {
            const setCoordinate = jest.fn();
            const setCustomValidity = jest.fn();
            const expected = "3"
            render(<MapCoordinatePixel
                coordinateName="longitude WEST"
                coordinateValue="1"
                coordinateMin="0"
                coordinateMax="5"
                setCoordinate={setCoordinate}
                validateCoordinate={(value) => (expectedValidationResult)}
            />);
            const element = screen.getByRole('spinbutton', { name: 'longitude WEST'})
            fireEvent.change(element, { target: { value: expected, setCustomValidity: setCustomValidity } });
            expect(setCustomValidity).toBeCalledWith(expectedValidationMessage);
            expect(setCoordinate).toBeCalledWith(expected); // even if invalid
        });
    });
    describe('pixel', () => { // these tests are very similar to the coordinate tests
        it('should display value', () => {
            render(<MapCoordinatePixel
                    pixelName="top pixel"
                    pixelValue="45"
                />);
            const element = screen.getByRole('spinbutton', { name: 'top pixel'});
            expect(element.value).toBe('45')
        });
        const validationTests = [
            [true, ''],
            [false, expect.stringMatching(/.*/)], // any string of nonzero length
        ];
        it.each(validationTests)('should set value and have proper validity when validation function returns %s',
            (expectedValidationResult, expectedValidationMessage) => {
            const setCoordinate = jest.fn();
            const setCustomValidity = jest.fn();
            const expected = "3"
            render(<MapCoordinatePixel
                pixelName="left pixel"
                pixelValue="1"
                pixelMin="0"
                pixelMax="5"
                setPixel={setCoordinate}
                validatePixel={(value) => (expectedValidationResult)}
            />);
            const element = screen.getByRole('spinbutton', { name: 'left pixel'});
            fireEvent.change(element, { target: { value: expected, setCustomValidity: setCustomValidity } });
            expect(setCustomValidity).toBeCalledWith(expectedValidationMessage);
            expect(setCoordinate).toBeCalledWith(expected); // even if invalid
        });
    });
});