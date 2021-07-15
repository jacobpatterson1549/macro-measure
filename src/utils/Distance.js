export const units = [
    'm',
    'km',
    'ft',
    'yd',
    'mi',
];

export const toMeters = (distance, unit, invert) => (
    _toMeters(distance, unit, false)
);

export const fromMeters = (distance, unit) => (
    _toMeters(distance, unit, true)
);

const _toMeters = (distance, unit, invert) => (
    (invert)
        ? distance / metersRatio(unit)
        : distance * metersRatio(unit)
);

const feetPerMeter = 0.3048;
const unitsPerMeter = {
    'm': 1,
    'km': 1000,
    'ft': feetPerMeter,
    'yd': 3 * feetPerMeter,
    'mi': 5280 * feetPerMeter,
};

const metersRatio = (unit) => (
    unitsPerMeter[unit] || NaN
);