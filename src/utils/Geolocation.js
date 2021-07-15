import { moveTo, headingDistanceTo } from 'geolocation-utils';

import { toMeters, fromMeters } from './Distance';

export const moveLatLngTo = (latLng, distance, unit, heading) => {
    if (!isValid(latLng)) {
        return {};
    }
    const amountMeters = toMeters(distance, unit);
    const headingDistance = { heading: heading, distance: amountMeters };
    return roundLatLng(moveTo(latLng, headingDistance));
};

export const getDistanceHeading = (latLng1, latLng2, unit) => {
    if (!isValid(latLng1) || !isValid(latLng2)) {
        return {};
    }
    const distanceHeading = headingDistanceTo(latLng1, latLng2);
    const distance = round(fromMeters(distanceHeading.distance, unit), 10);
    return {
        distance: round(distance, 10),
        heading: round(distanceHeading.heading, 10),
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
        lat: round(latLng.lat, 10000000),
        lng: round(latLng.lng, 10000000),
    }
);

export const getAccuracy = (distance, unit) => (
    round(fromMeters(distance, unit), 10)
);

const isValid = (latLng) => (
    latLng
    && Number.isInteger(parseInt(latLng.lat))
    && Number.isInteger(parseInt(latLng.lng))
);

const round = (value, expTenDigits) => ( // log_10(expTenDigits) decimal digits, should be a one followed by 'numDigit' zeros - for three decimals, pass 1000
    Math.round(value * expTenDigits) / expTenDigits
);