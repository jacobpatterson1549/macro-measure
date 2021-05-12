// TODO: use geolocation (and https)
export function GetCurrentLatLng() {
    const getRandom = (max) => Math.random() * max;
    const lat = getRandom(180) - 90;
    const lng = getRandom(360) - 180;
    return { lat: lat, lng: lng };
};

// TODO
export function UpdateLatLng(latLng, deltaN, deltaE, distanceUnit) {
    return latLng;
};

// TODO
export function GetDistance(latLng1, latLng2, distanceUnit) {
    // TODO: also return heading
    return 0;
}

export const toMeters = (value, distanceUnit) => (
    distanceUnit === 'm' ? value
        : distanceUnit === 'km' ? value * 1000
        : distanceUnit === 'ft' ? value * 3048 / 10000
        : distanceUnit === 'yd' ? value * 3 * 3048 / 10000
        : distanceUnit === 'mi' ? value * 5280 * 3048 / 10000
        : NaN
);