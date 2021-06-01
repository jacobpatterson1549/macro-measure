import { moveTo, headingDistanceTo } from 'geolocation-utils';

export const moveLatLngTo = (latLng, distance, unit, heading) => {
    if (!isValid(latLng)) {
        return {};
    }
    const amountMeters = _toMeters(distance, unit);
    const headingDistance = { heading: heading, distance: amountMeters };
    return roundLatLng(moveTo(latLng, headingDistance));
};

export const getDistanceHeading = (latLng1, latLng2, unit) => {
    if (!isValid(latLng1) || !isValid(latLng2)) {
        return {};
    }
    const distanceHeading = headingDistanceTo(latLng1, latLng2);
    const distance = round(_fromMeters(distanceHeading.distance, unit), 1);
    return {
        distance: round(distance, 1),
        heading: round(distanceHeading.heading, 1),
    };
};

export const Heading = {
    N: 0,
    E: 90,
    S: 180,
    W: -90,
};

export const roundLatLng = (latLng) => (
    {
        lat: round(latLng.lat, 7),
        lng: round(latLng.lng, 7),
    }
);

export const _toMeters = (distance, unit, invert) => ( // exported for testing
    (invert)
        ? distance / metersRatio(unit)
        : distance * metersRatio(unit)
);

export const _fromMeters = (distance, unit) => ( // exported for testing
    _toMeters(distance, unit, true)
);

const isValid = (latLng) => (
    latLng && latLng.lat !== undefined && latLng.lng !== undefined
);

const round = (value, numDigits) => {
    const m = Math.pow(10, numDigits);
    return Math.round(value * m) / m;
};

const metersRatio = (unit) => (
    unit === 'm' ? 1
        : unit === 'km' ? 1000
            : unit === 'ft' ? 3048 / 10000
                : unit === 'yd' ? 3 * 3048 / 10000
                    : unit === 'mi' ? 5280 * 3048 / 10000
                        : NaN
);