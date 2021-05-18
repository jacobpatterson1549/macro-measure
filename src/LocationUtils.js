import { moveTo, headingDistanceTo } from 'geolocation-utils';

export const MoveTo = (latLng, distance, unit, heading) => {
    const amountMeters = _toMeters(distance, unit);
    const headingDistance = { heading: heading, distance: amountMeters };
    const latLng2 = moveTo(latLng, headingDistance);
    return {
        lat: round(latLng2.lat, 7),
        lng: round(latLng2.lng, 7),
    };
};

export const GetDistanceHeading = (latLng1, latLng2, unit) => {
    const distanceHeading = headingDistanceTo(latLng1, latLng2);
    const distance = round(_fromMeters(distanceHeading.distance, unit), 1);
    return {
        distance: round(distance, 1),
        heading: round(distanceHeading.heading, 1),
    };
};

const round = (value, numDigits) => {
    const m = Math.pow(10, numDigits);
    return Math.round(value * m) / m;
};

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