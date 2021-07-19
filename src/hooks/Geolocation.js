import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';
import { getGeolocation } from '../utils/Global';

export const useGeolocation = (view, highAccuracyGPS, setGPSOn) => {
    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);
    const [accuracy, setAccuracy] = useState(noAccuracy);
    useEffect(() => {
        if (!watchID.current && View.needsGPS(view) && getGeolocation()) {
            startWatch(watchID, highAccuracyGPS, setLatLng, setAccuracy, setGPSOn);
        }
        return () => {
            stopWatch(watchID, setGPSOn);
        };
    }, [view, highAccuracyGPS, setGPSOn]);
    return {
        ...latLng,
        accuracy: accuracy,
        valid: !!getGeolocation(), // not actually state, only fetched between refreshes
    };
};

const startWatch = (watchID, highAccuracyGPS, setLatLng, setAccuracy, setGPSOn) => {
    stopWatch(watchID, setGPSOn);
    const success = handleSuccess(setLatLng, setAccuracy);
    const error = handleError(watchID, setLatLng, setAccuracy, setGPSOn);
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

const handleSuccess = (setLatLng, setAccuracy) => (geolocationPosition) => {
    const position = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
    };
    const roundedPosition = roundLatLng(position);
    const accuracy = geolocationPosition.coords.accuracy;
    setLatLng(roundedPosition);
    setAccuracy(accuracy)
};

const handleError = (watchID, setLatLng, setAccuracy, setGPSOn) => () => {
    setLatLng(null);
    setAccuracy(noAccuracy)
    stopWatch(watchID, setGPSOn);
};

const noAccuracy = '∞';