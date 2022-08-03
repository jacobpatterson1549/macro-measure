import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';
import { getGeolocation } from '../utils/Global';

export const useGeolocation = (view, highAccuracyGPS, setGPSOn) => {
    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);
    const [accuracy, setAccuracy] = useState(noAccuracy); // meters
    const [speed, setSpeed] = useState(0); // meters/second
    const [heading, setHeading] = useState(null);
    useEffect(() => {
        if (!watchID.current && View.needsGPS(view) && getGeolocation()) {
            startWatch(watchID, highAccuracyGPS, setLatLng, setAccuracy, setSpeed, setHeading, setGPSOn);
        }
        return () => {
            stopWatch(watchID, setGPSOn);
        };
    }, [view, highAccuracyGPS, setGPSOn]);
    return {
        ...latLng,
        accuracy: accuracy,
        speed: speed,
        heading: heading,
        valid: !!getGeolocation(), // not actually state, only fetched between refreshes
    };
};

const startWatch = (watchID, highAccuracyGPS, setLatLng, setAccuracy, setSpeed, setHeading, setGPSOn) => {
    stopWatch(watchID, setGPSOn);
    const success = handleSuccess(setLatLng, setAccuracy, setSpeed, setHeading);
    const error = handleError(watchID, setLatLng, setAccuracy, setSpeed, setHeading, setGPSOn);
    const options = {
        enableHighAccuracy: highAccuracyGPS,
    };
    watchID.current = getGeolocation().watchPosition(success, error, options);
    setGPSOn(true);
};

const stopWatch = (watchID, setGPSOn) => {
    getGeolocation()?.clearWatch(watchID.current);
    watchID.current = null;
    setGPSOn(false);
};

const handleSuccess = (setLatLng, setAccuracy, setSpeed, setHeading) => (geolocationPosition) => {
    const position = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
    };
    const roundedPosition = roundLatLng(position);
    const accuracy = geolocationPosition.coords.accuracy;
    const speed = geolocationPosition.coords.speed;
    const heading = geolocationPosition.coords.heading;
    setLatLng(roundedPosition);
    setAccuracy(accuracy);
    setSpeed(speed);
    setHeading(heading);
};

const handleError = (watchID, setLatLng, setAccuracy, setSpeed, setHeading, setGPSOn) => () => {
    setLatLng(null);
    setAccuracy(noAccuracy);
    setSpeed(0);
    setHeading(null);
    stopWatch(watchID, setGPSOn);
};

const noAccuracy = '∞';