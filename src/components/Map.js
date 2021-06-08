import './Map.css';

import { moveLatLngTo } from '../utils/Geolocation';

export const Map = (props) => {
    const [center, heading] = (props.device && props.distanceHeading)
        ? [
            moveLatLngTo(props.item, props.distanceHeading.distance / 2, props.distanceUnit, props.distanceHeading.heading),
            props.distanceHeading.heading,
        ]
        : [
            props.item,
            0,
        ];
    const derivedProps = {
        center,
        heading,
    };
    return render({ ...props, ...derivedProps });
};

const render = ({ item, device, center, heading }) => (
    <div className="Map">
        <h3>TODO: map</h3>
        <p>{item.name}: [{item.lat}, {item.lng}]</p>
        {
            device &&
            <p>you: [{device.lat}, {device.lng}]</p>
        }
        <p title="degrees clockwise from north">heading: {heading}</p>
        <p>map center: [{center.lat}, {center.lng}]</p>
    </div>
);