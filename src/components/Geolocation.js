import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Geolocation = ({ render, view, highAccuracyGPS }) => {
    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);
    useEffect(() => {
        if (!watchID.current && View.needsGPS(view)) {
            startWatch(watchID, setLatLng, highAccuracyGPS);
        }
        return () => {
            stopWatch(watchID);
        };
    }, [view, highAccuracyGPS]);
    const props = {
        valid: !!getGeolocation(),
        latLng: latLng,
    };
    return render(props);
};

const startWatch = (watchID, setLatLng, highAccuracyGPS) => {
    stopWatch(watchID);
    const success = handleSuccess(setLatLng);
    const error = handleError(setLatLng);
    const options = {
        enableHighAccuracy: highAccuracyGPS,
    };
    watchID.current = getGeolocation()?.watchPosition(success, error, options);
};

const stopWatch = (watchID) => {
    getGeolocation()?.clearWatch(watchID.current);
    watchID.current = null;
};

const handleSuccess = (setLatLng) => (geolocationPosition) => {
    const position = {
        lat: geolocationPosition.coords.latitude,
        lng: geolocationPosition.coords.longitude,
    };
    const roundedPosition = roundLatLng(position);
    setLatLng(roundedPosition);
};

const handleError = (setLatLng) => () => {
    setLatLng(null);
};

const getGeolocation = () => (
    window.navigator.geolocation
);