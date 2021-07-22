import './WaypointImg.css';

import { moveLatLngTo, getAccuracy } from '../utils/Geolocation';

export const WaypointImg = (props) => {
    const [center, heading] = (props.device && props.distanceHeading)
        ? [
            moveLatLngTo(props.item, props.distanceHeading.distance / 2, props.distanceUnit, props.distanceHeading.heading),
            props.distanceHeading.heading,
        ]
        : [
            props.item,
            0,
        ];
    const accuracy = props.accuracy ? getAccuracy(props.accuracy, props.distanceUnit) : false;
    const derivedProps = {
        center,
        heading,
        accuracy,
    };
    return render({ ...props, ...derivedProps });
};

const render = ({ item, device, center, heading, accuracy, distanceUnit }) => (
    <div className="WaypointImg">
        <h3>TODO: map</h3>
        <p>{item.name}: [{item.lat}, {item.lng}]</p>
        {
            device &&
            <p>you: [{device.lat}, {device.lng}]</p>
        }
        <p title="degrees clockwise from north">heading: {heading}</p>
        {
            accuracy &&
            <p>accuracy: {accuracy} {distanceUnit}</p>
        }
        <p>map center: [{center.lat}, {center.lng}]</p>
    </div>
);