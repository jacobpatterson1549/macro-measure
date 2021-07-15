import { units, toMeters, fromMeters } from './Distance';

describe('Distance', () => {
    describe('units', () => {
        it.each(units)('should convert 1 %s to meters', (unit) => {
            expect(toMeters(1, unit)).toBeTruthy();
        });
        it.each(units)('should convert 1 meter to %ss', (unit) => {
            expect(fromMeters(1, unit)).toBeTruthy();
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
        it.each(conversions)('should convert %d %s %d meters', (distance, unit, expected) => {
            const m = toMeters(distance, unit);
            expect(m).toBeCloseTo(expected, decimalPrecisionDigits);
        });
        it.each(conversions)('should convert back to %d %s when at %d meters', (distance, unit, expected) => {
            const m = toMeters(distance, unit);
            const actual = fromMeters(m, unit);
            expect(actual).toBeCloseTo(distance, decimalPrecisionDigits);
        });
        const nanTests = [
            ['cubit', 'to', toMeters],
            ['nautical mile', 'from', fromMeters]
        ]
        it.each(nanTests)('should not convert %s (unknown distance) unit %s meters', (unit, direction, fn) => {
            const m = fn(0, unit);
            expect(m).toBeNaN();
        });
    });
});