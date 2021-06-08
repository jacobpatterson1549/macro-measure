import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Geolocation = (props) => {
    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);
    useEffect(() => {
        if (!watchID.current && View.needsGPS(props.view) && getGeolocation()) {
            startWatch(watchID, props.highAccuracyGPS, setLatLng, props.setGPSOn);
        }
        return () => {
            stopWatch(watchID, props.setGPSOn);
        };
    }, [props.view, props.highAccuracyGPS, props.setGPSOn]);
    const state = {
        valid: !!getGeolocation(),
        latLng: latLng,
    };
    return props.render({ ...state });
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
    getGeolocation()?.clearWatch(watchID.current);
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