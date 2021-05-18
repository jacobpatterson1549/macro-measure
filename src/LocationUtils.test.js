import { moveLatLngTo, getDistanceHeading, _toMeters, _fromMeters } from './LocationUtils'

describe('Distance', () => {
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
    test.each(distanceTests)('moveLatLngTo: distance %s%s with a heading %d° from should end at %s',
        (distance, unit, heading, latLng, expectedLatLng) => {
            const actualLatLng = moveLatLngTo(latLng, distance, unit, heading);
            expect(actualLatLng.lat).toBeCloseTo(expectedLatLng.lat, 7);
            expect(actualLatLng.lng).toBeCloseTo(expectedLatLng.lng, 7);
        });
    test.each(distanceTests)('getDistanceHeading: expected distance of %s%s with a heading of %d° whet getting distance from %s to %s',
        (expectedDistance, unit, expectedHeading, latLng1, latLng2) => {
            const actualDistanceHeading = getDistanceHeading(latLng1, latLng2, unit);
            expect(actualDistanceHeading.distance).toBeCloseTo(expectedDistance, 1);
            expect(actualDistanceHeading.heading).toBeCloseTo(expectedHeading, 1);
        });
});

describe('meters conversions', () => {
    const conversions = [
        [0, 'm', 0],
        [0, 'yd', 0],
        [1, 'm', 1],
        [1, 'km', 1000],
        [37, 'km', 37000],
        [.06, 'km', 60],
        [1, 'ft', 0.3048],
        [10000, 'ft', 3048],
        [32, 'ft', 9.7536],
        [10000, 'yd', 9144],
        [1, 'yd', 0.9144],
        [100, 'yd', 91.44],
        [1, 'mi', 1609.344],
        [125, 'mi', 201168],
        [3.14159, 'km', 3141.59], // not exact
    ];
    const decimalPrecisionDigits = 10;
    test.each(conversions)('toMeters(%d, %s) should be %d meters', (distance, unit, expected) => {
        const m = _toMeters(distance, unit);
        expect(m).toBeCloseTo(expected, decimalPrecisionDigits);
    });
    test.each(conversions)('fromMeters() of toMeters(%d, %s) should be the same', (distance, unit) => {
        const m = _toMeters(distance, unit);
        const distance2 = _fromMeters(m, unit);
        expect(distance2).toBeCloseTo(distance, decimalPrecisionDigits);
    })
});