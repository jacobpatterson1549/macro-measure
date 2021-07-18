import { moveLatLngTo, getDistanceHeading, getAccuracy } from './Geolocation';

describe('Geolocation', () => {
    describe('LatLng calculations', () => {
        const distanceTests = [
            [0.0, 'm', 0, { lat: 51.4934, lng: 0.0098 }, { lat: 51.4934, lng: 0.0098 }],
            [131.5, 'm', 32.1, { lat: 51, lng: 4 }, { lat: 51.00100069207888, lng: 4.000997477543457 }], // from doc
            [100.0, 'mi', 0, { lat: 51.4934, lng: 0 }, { lat: 52.93909831260605, lng: 0 }], // N
            [100.0, 'yd', 180, { lat: 51.4934, lng: 0 }, { lat: 51.4925785805042, lng: 0 }], // S
            [600.0, 'km', 90, { lat: 0, lng: 0 }, { lat: 0, lng: 5.3898917047171295 }], // E
            [600.0, 'km', -90, { lat: 0, lng: 0 }, { lat: 0, lng: -5.3898917047171295 }], // W
            [1.0, 'ft', 0, { lat: 0, lng: 0 }, { lat: 0.0000027, lng: 0 }], // N
            [1.0, 'ft', 90, { lat: 0, lng: 0 }, { lat: 0, lng: 0.0000027 }], // E
        ];
        it.each(distanceTests)('should move LatLng distance %s%s with a heading %d° from %s to %s',
            (distance, unit, heading, latLng, expectedLatLng) => {
                const actualLatLng = moveLatLngTo(latLng, distance, unit, heading);
                expect(actualLatLng.lat).toBeCloseTo(expectedLatLng.lat, 7);
                expect(actualLatLng.lng).toBeCloseTo(expectedLatLng.lng, 7);
            });
        it.each(distanceTests)('should get distance %s%s with a heading of %d° between %s and %s',
            (expectedDistance, unit, expectedHeading, latLng1, latLng2) => {
                const actualDistanceHeading = getDistanceHeading(latLng1, latLng2, unit);
                expect(actualDistanceHeading.distance).toBeCloseTo(expectedDistance, 1);
                expect(actualDistanceHeading.heading).toBeCloseTo(expectedHeading, 1);
            });
        describe('isValid', () => {
            const badMoveLatLng = [
                undefined,
                {},
                { lat: 1 },
                { lng: 1 },
                { lat: '[current]', lng: '[current]' },
            ];
            const [unit, distance, heading] = ['m', 0, 0];
            it.each(badMoveLatLng)('should return empty object when latLng is %s', (latLng) => {
                const actual = moveLatLngTo(latLng, distance, unit, heading);
                expect(actual).toStrictEqual({});
            });
            const badDistanceHeadingLatLngPairs = [
                [undefined, { lat: 1, lng: 1 }],
                [{ lat: 1, lng: 1 }, undefined],
                [{ lat: '[current]', lng: '[current]' }, { lat: 1, lng: 1 }],
            ];
            it.each(badDistanceHeadingLatLngPairs)('should return empty object when latLng1 is %s and latLang2 is %s', (latLng1, latLng2) => {
                const actual = getDistanceHeading(latLng1, latLng2, unit);
                expect(actual).toStrictEqual({});
            });
        })
    });
    describe('accuracy', () => {
        it('should get accuracy rounded to one decimal point', () => {
            const distance = 20;
            const unit = 'yd'
            const actual = getAccuracy(distance, unit)
            const expected = 21.9;
            expect(actual).toBe(expected);
        });
    });
});