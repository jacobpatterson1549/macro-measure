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
    const distance = _round(_fromMeters(distanceHeading.distance, unit), 1);
    return {
        distance: _round(distance, 1),
        heading: _round(distanceHeading.heading, 1),
    };
};

const isValid = (latLng) => (
    latLng && latLng.lat !== undefined && latLng.lng !== undefined
);

const _round = (value, numDigits) => {
    const m = Math.pow(10, numDigits);
    return Math.round(value * m) / m;
};

export const roundLatLng = (latLng) => {
    return {
        lat: _round(latLng.lat, 7),
        lng: _round(latLng.lng, 7),
    };
}

export const _toMeters = (distance, unit, invertRatio) => {
    let ratio = unit === 'm' ? 1
        : unit === 'km' ? 1000
            : unit === 'ft' ? 3048 / 10000
                : unit === 'yd' ? 3 * 3048 / 10000
                    : unit === 'mi' ? 5280 * 3048 / 10000
                        : NaN;
    if (invertRatio) {
        ratio = 1 / ratio;
    }
    return distance * ratio;
};

export const _fromMeters = (distance, unit) => {
    return _toMeters(distance, unit, true);
};

export const Heading = {
    N: 0,
    E: 90,
    S: 180,
    W: -90,
};