import { useState, useEffect } from 'react';

import './Compass.css';

import { fromMeters } from '../utils/Distance';
import { getDistanceHeading, getAccuracy } from '../utils/Geolocation';

export const Compass = (props) => {
    const accuracy = props.accuracy ? getAccuracy(props.accuracy, props.distanceUnit) : false;
    const [distanceHeading, setDistanceHeading] = useState(null);
    const [compassHeading, setCompassHeading] = useState(null);
    const derivedProps = {
        compassHeading,
        distanceHeading,
        accuracy,
    };
    useEffect(() => {
        const distanceHeading2 = (props.item && props.device)
            ? getDistanceHeading(
                { lat: props.item.lat, lng: props.item.lng },
                { lat: props.device.lat, lng: props.device.lng },
                props.distanceUnit)
            : null;
        setDistanceHeading(distanceHeading2);
    }, [setDistanceHeading, props.item, props.device, props.distanceUnit]);
    useEffect(() => {
        if (distanceHeading && props.device.speed && speedMPH(props.device.speed) >= 0.1) {
            const heading = parseInt(distanceHeading.heading) - parseInt(props.device.heading);
            setCompassHeading(heading);
        }
    }, [setCompassHeading, distanceHeading, props.device]);
    return render({ ...props, ...derivedProps });
};

const speedMPH = (speedMetersPerSecond) => (
    fromMeters(speedMetersPerSecond * 60 * 60, 'mi')
);

const render = (props) => (
    <div className="Compass">
        {/* {debug(props)} */}
        {renderCompass(props.compassHeading)}
        {props.distanceHeading && renderDistance(props.distanceHeading.distance, props.distanceUnit, props.accuracy)}
    </div>
);

// const debug = (distanceHeading, compassHeading, accuracy, distanceUnit, item, device) => (
//     <div>
//         <div>Item: {JSON.stringify(item)}</div>
//         <div>Device: {JSON.stringify(device)}</div>
//         <div>DistanceHeading: {JSON.stringify(distanceHeading)}</div>
//         <div>CompassHeading: {JSON.stringify(compassHeading)}</div>
//         <div>Accuracy: {JSON.stringify(accuracy)}</div>
//         <div>DistanceUnit: {JSON.stringify(distanceUnit)}</div>
//     </div>
// );

const renderCompass = (compassHeading) => (
    <svg role="img" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="0" r="45%" fill="none" stroke="black" strokeWidth="1%" />
        {compassHeading && <>
            <title>Compass at {compassHeading} degrees CCW of the top of device</title>
            <g transform={'rotate(' + compassHeading + ')'}>
                <polygon points="0,-45 5,0 -5,0" fill="red" stroke="red" strokeWidth="1%" />
                <polygon points="0,45 5,0 -5,0" fill="none" stroke="black" strokeWidth="1%" />
            </g>
        </>}
    </svg>
);

const renderDistance = (distance, distanceUnit, accuracy) => (
    <>
        <div className="distance">
            <span>{String(distance)}</span>
            <span className="unit"> {distanceUnit}</span>
        </div>
        {accuracy && distanceUnit && renderAccuracy(accuracy, distanceUnit)}
    </>
);

const renderAccuracy = (accuracy, distanceUnit) => (
    <div>accuracy: {accuracy} {distanceUnit}</div>
);