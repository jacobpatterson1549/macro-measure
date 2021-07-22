import { useState, useEffect } from 'react';

import { WaypointForm } from './WaypointForm';
import { WaypointImg } from './WaypointImg';

import { useGeolocation } from '../hooks/Geolocation';

import { View } from '../utils/View';
import { getDistanceHeading } from '../utils/Geolocation';

export const Waypoint = (props) => {
    const geolocation = useGeolocation(props.view, props.highAccuracyGPS, props.setGPSOn);
    const [mapItem, setMapItem] = useState(null);
    const [mapDevice, setMapDevice] = useState(null);
    const [distanceHeading, setDistanceHeading] = useState(null);
    useEffect(() => {
        const distanceHeading2 = (View.isRead(props.view) && geolocation.lat && geolocation.lng && props.item && props.item.lat && props.item.lng)
            ? getDistanceHeading(
                { lat: props.item.lat, lng: props.item.lng },
                { lat: geolocation.lat, lng: geolocation.lng },
                props.distanceUnit)
            : null;
        setDistanceHeading(distanceHeading2);
    }, [setDistanceHeading, props.view, geolocation.lat, geolocation.lng, props.item, props.distanceUnit]);
    useEffect(() => {
        const mapItem2 = (View.isCreate(props.view) && geolocation.lat && geolocation.lng)
            ? { name: 'Waypoint', lat: geolocation.lat, lng: geolocation.lng }
            : props.item
        setMapItem(mapItem2);
    }, [setMapItem, props.item, props.view, geolocation.lat, geolocation.lng]);
    useEffect(() => {
        const mapDevice2 = (geolocation.valid && distanceHeading && geolocation.lat && geolocation.lng)
            ? { lat: geolocation.lat, lng: geolocation.lng }
            : null;
        setMapDevice(mapDevice2);
    }, [setMapDevice, geolocation.valid, geolocation.lat, geolocation.lng, distanceHeading]);
    const state = {
        mapItem, mapDevice,
        geolocation,
        distanceHeading,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <>
        {getWaypointImg(props)}
        {getWaypointForm(props)}
    </>
);

const getWaypointForm = (props) => {
    if (!props.geolocation.valid) {
        return (<span>Cannot get location</span>); // TODO: It should be possible to delete a waypoint when the geolocation is invalid.
    }
    return (<WaypointForm {...props} />);
};

const getWaypointImg = (props) => {
    if (!props.geolocation.valid) {
        return (<p>[Map disabled]</p>)
    }
    if (!props.mapItem || !props.mapItem.lat || !props.mapItem.lng) {
        return (<p>Waiting for GPS...</p>);
    }
    return (<WaypointImg
        item={props.mapItem}
        device={props.mapDevice}
        accuracy={props.geolocation.accuracy}
        distanceHeading={props.distanceHeading}
        distanceUnit={props.distanceUnit}
    />);
};