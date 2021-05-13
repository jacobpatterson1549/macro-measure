import { moveTo, headingDistanceTo } from 'geolocation-utils'

// TODO: use https
export function GetCurrentLatLng() {
    const getRandom = (max) => Math.random() * max;
    const lat = getRandom(180) - 90;
    const lng = getRandom(360) - 180;
    return { lat: lat, lng: lng };
};

export function MoveTo(latLng, distance, unit, heading) {
    const amountMeters = toMeters(distance, unit);
    const headingDistance = { heading: heading, distance: amountMeters };
    const latLng2 = moveTo(latLng, headingDistance);
    const latLng3 = { lat: latLng2.lat, lng: latLng2.lng };
    return latLng3;
};

export function GetDistanceHeading(latLng1, latLng2, unit) {
    const distanceHeading = headingDistanceTo(latLng1, latLng2);
    // calculate distance and heading to one decimal place
    // TODO: allow precision to be set
    const distance = Math.round(fromMeters(distanceHeading.distance, unit) * 10) / 10;
    const heading = Math.round(distanceHeading.heading * 10) / 10;
    const distanceHeading2 = { distance: distance, heading: heading };
    return distanceHeading2;
}

export function toMeters(distance, unit, invertRatio) {
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
}

export function fromMeters(distance, unit) {
    return toMeters(distance, unit, true)
}

export const Heading = {
    N: 0,
    E: 90,
    S: 180,
    W: -90,
};