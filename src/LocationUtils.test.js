import { toMeters } from './LocationUtils'

describe('toMeters', () => {
    const toMetersExact = [
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
    ];
    test.each(toMetersExact)('toMeters(%s, %s) should be exactly %s meters', (value, distanceUnit, expected) => {
        const m = toMeters(value, distanceUnit)
        expect(m).toBe(expected)
    });
    const toMetersClose = [
        [3.14159, 'km', 3141.59],
    ];
    test.each(toMetersClose)('toMeters(%s, %s) should be close to %s meters', (value, distanceUnit, expected) => {
        const m = toMeters(value, distanceUnit)
        expect(m).toBeCloseTo(expected)
    });
});