import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Geolocation = ({ render, view, highAccuracyGPS, setGPSOn }) => {
    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);
    useEffect(() => {
        if (!watchID.current && View.needsGPS(view) && getGeolocation()) {
            startWatch(watchID, highAccuracyGPS, setLatLng, setGPSOn);
        }
        return () => {
            stopWatch(watchID, setGPSOn);
        };
    }, [view, highAccuracyGPS, setGPSOn]);
    const props = {
        valid: !!getGeolocation(),
        latLng: latLng,
    };
    return render(props);
};

const startWatch = (watchID, highAccuracyGPS, setLatLng, setGPSOn) => {
    stopWatch(watchID, setGPSOn);
    const success = handleSuccess(setLatLng);
    const error = handleError(setLatLng, watchID, setGPSOn);
    const options = {
        enableHighAccuracy: highAccuracyGPS,
    };
    watchID.current = getGeolocation().watchPosition(success, error, options);
    setGPSOn(true);
};

const stopWatch = (watchID, setGPSOn) => {
    if (getGeolocation()) {
        getGeolocation().clearWatch(watchID.current);
    }
    watchID.current = null;
    setGPSOn(false);
};

const handleSuccess = (setLatLng) => (geolocationPosition) => {
    const position = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
    };
    const roundedPosition = roundLatLng(position);
    setLatLng(roundedPosition);
};

const handleError = (setLatLng, watchID, setGPSOn) => () => {
    setLatLng(null);
    stopWatch(watchID, setGPSOn);
};

const getGeolocation = () => (
    window.navigator.geolocation
);