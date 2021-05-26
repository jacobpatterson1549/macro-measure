import { useState, useRef, useEffect } from 'react';

import { roundLatLng } from '../utils/LocationUtils';
import { View } from '../utils/View';

const locationViews = [View.Item_Read, View.Item_Create];

const geolocation = () => window.navigator.geolocation;

// Geolocation watches the position, rendering it when it changes.
export const Geolocation = ({
    render,
    view, // the current page
    highAccuracyGPS, // enables the GPS to be more precise // TODO: rename all these fields to enableHighAccuracy
}) => {

    const watchID = useRef(null);
    const [latLng, setLatLng] = useState(null);

    useEffect(() => {
        const stopWatch = (() => {
            geolocation().clearWatch(watchID.current);
            watchID.current = null
        });
        const success = async (geolocationPosition) => {
            if (view !== View.Item_Read) {
                stopWatch();
            }
            const position = {
                lat: geolocationPosition.coords.latitude,
                lng: geolocationPosition.coords.longitude,
            };
            const roundedPosition = roundLatLng(position);
            setLatLng(roundedPosition);
        };
        const error = (error) => {
            setLatLng(null);
        };
        const options = {
            enableHighAccuracy: highAccuracyGPS,
        };
        const startWatch = () => {
            stopWatch();
            watchID.current = geolocation().watchPosition(success, error, options);
        };

        if (!watchID.current && locationViews.includes(view) && geolocation()) {
            startWatch();
        }
        return () => {
            if (geolocation()) {
                stopWatch();
            }
        };
    }, [view, highAccuracyGPS]);

    return (
        <>
            {render({
                valid: !!geolocation(),
                latLng: latLng,
            })}
        </>
    );
};