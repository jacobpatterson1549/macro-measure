import { render, screen } from '@testing-library/react';

import { Compass } from './Compass';

describe('Compass', () => {
    describe('accuracy', () => {
        const accuracyTests = [
            ['', 'everything is specified', true, { item: { lat: 0, lng: 0 }, device: { lat: 0, lng: 0 }, accuracy: 20, distanceUnit: 'yd' }], // distanceUnit required because NaN is falsy
            ['NOT ', 'there is no device', false, { item: { lat: 0, lng: 0 }, accuracy: 20, distanceUnit: 'yd' }],
        ];
        it.each(accuracyTests)('should %shave GPS accuracy %s', (q, description, expected, props) => {
            render(<Compass {...props} />);
            const element = screen.queryByText(/accuracy/);
            expect(!!element === expected).toBeTruthy()
        });
    });
    describe('compassHeading', () => {
        const compassHeadingTestsGOOD = [
            [{ item: { lat: 51.4934, lng: 0.0098 }, device: { lat: 0, lng: 0.0098, speed: 2.5, heading: 90 }, distanceUnit: 'mi' }, 90], // running west at origin, goal is greenwich
            [{ item: { lat: 2, lng: -2 }, device: { lat: 0, lng: 0, speed: 1, heading: 90 } }, 45], // walking east at 1,-1, goal is 2,-2
            [{ item: { lat: 51.5, lng: 0 }, device: { lat: 0, lng: 0, speed: 0.01, heading: 90 } }, null], // speed to slow
        ];
        it.each(compassHeadingTestsGOOD)('should have compassHeading when props are %s at %s', (props, expected) => {
            render(<Compass {...props} />);
            const prefix = 'Compass at';
            const element = screen.queryByTitle(prefix, { exact: false});
            if (!!expected) {
                expect(element).toBeInTheDocument();
                // check the actual degrees
                const element2 = screen.queryByTitle(prefix + ' ' + expected + ' degrees', { exact: false});
                if (!element2) {
                    console.log(element);
                }
                expect(element2).toBeInTheDocument();
            } else {
                expect(element).not.toBeInTheDocument()
            }
        });
    })
});