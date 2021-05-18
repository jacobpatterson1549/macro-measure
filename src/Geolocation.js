import { useState, useEffect, useCallback } from 'react';

import { roundLatLng } from './LocationUtils';

const needsLocation = (view) => ['item-read', 'item-create'].includes(view);

export const Geolocation = ({
    view, // the current page
    newItem, // func to create a new item from a latLng
    setItem, // func to set the item
    setCurrentLatLng, // func to set the current latLng
    disable, // function to indicate that the device does not support gps location
}) => {
    const [timerID, setTimerID] = useState(null);

    const stopTimer = useCallback(() => {
        if (timerID !== null) {
            clearInterval(timerID);
        }
    }, [timerID]);

    const setPosition = useCallback((position) => {
        if (view !== 'item-read') {
            stopTimer();
        }
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const latLng = { lat: latitude, lng: longitude };
        setCurrentLatLng(roundLatLng(latLng));
        if (view === 'item-create') {
            setItem(newItem(latLng));
        }
    }, [view, stopTimer, setCurrentLatLng, setItem, newItem]);

    const startTimer = useCallback(() => {
        const success = setPosition;
        const error = disable;
        const options = {
            enableHighAccuracy: false, // TODO: allow this to be a setting
        };
        stopTimer();
        setTimerID(navigator.geolocation.watchPosition(success, error, options));
    }, [setPosition, disable, stopTimer, setTimerID]);

    useEffect(() => {
        if (needsLocation(view) && timerID === null) {
            if (navigator.geolocation) {
                startTimer();
            } else {
                disable();
            }
        }
        return stopTimer;
    }, [view, timerID, disable, startTimer, stopTimer]);

    return null;
};