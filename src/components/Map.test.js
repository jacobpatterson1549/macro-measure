import { render, screen } from '@testing-library/react';

import { Map } from './Map';

describe('Map', () => {
    const deviceTests = [
        ['', true, { item: { lat: 0, lng: 0 }, device: { lat: 0, lng: 0 } }],
        ['NOT ', false, { item: { lat: 0, lng: 0 } }],
    ];
    it.each(deviceTests)('should %shave your location', (q, expected, props) => {
        render(<Map {...props} />);
        const element = screen.queryByText(/you/);
        expect(!!element === expected).toBeTruthy()
    });
    const accuracyTests = [
        ['', true, { item: { lat: 0, lng: 0 }, accuracy: 20, distanceUnit: 'yd' }], // distanceUnit required because NaN is falsy
        ['NOT ', false, { item: { lat: 0, lng: 0 } }],
    ];
    it.each(accuracyTests)('should %shave GPS accuracy', (q, expected, props) => {
        render(<Map {...props} />);
        const element = screen.queryByText(/accuracy/);
        expect(!!element === expected).toBeTruthy()
    });
});