import { useState, useEffect, useCallback } from 'react';

import { roundLatLng } from './LocationUtils';
import { View } from './View';

const locationViews = [View.Item_Read, View.Item_Create];

const geolocation = window.navigator.geolocation;

export const Geolocation = ({
    view, // the current page
    highAccuracyGPS, // enables the GPS to be more precise
    newItem, // func to create a new item from a latLng
    setItem, // func to set the item
    setCurrentLatLng, // func to set the current latLng
    disable, // function to indicate that the device does not support gps location
}) => {
    const [timerID, setTimerID] = useState(null);

    const stopTimer = useCallback(() => {
        if (timerID !== null) {
            clearInterval(timerID);
            setTimerID(null);
        }
    }, [timerID]);

    const setPosition = useCallback((position) => {
        if (view !== View.Item_Read) {
            stopTimer();
        }
        if (!locationViews.includes(view)) {
            return;
        }
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const latLng = { lat: latitude, lng: longitude };
        setCurrentLatLng(roundLatLng(latLng));
        if (view === View.Item_Create) {
            setItem(newItem(latLng));
        }
    }, [view, setItem, newItem, setCurrentLatLng, stopTimer]);

    const startTimer = useCallback(() => {
        const success = setPosition;
        const error = disable;
        const options = {
            enableHighAccuracy: highAccuracyGPS,
        };
        stopTimer();
        setTimerID(geolocation.watchPosition(success, error, options));
    }, [highAccuracyGPS, disable, setPosition, stopTimer, setTimerID]);

    useEffect(() => {
        if (timerID === null && locationViews.includes(view)) {
            if (geolocation) {
                startTimer();
            } else {
                disable();
            }
        }
        return stopTimer;
    }, [view, disable, timerID, startTimer, stopTimer]);

    return null;
};