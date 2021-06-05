import './Map.css';

import { moveLatLngTo } from '../utils/Geolocation';

export const Map = ({ item, device, distanceHeading, distanceUnit }) => {
    const [center, heading] = (device && distanceHeading)
        ? [moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading), distanceHeading.heading]
        : [item, 0];
    const props = { item, device, center, heading };
    return render(props);
};

const render = (props) => (
    <div className="Map">
        <h3>TODO: map</h3>
        <p>{props.item.name}: [{props.item.lat}, {props.item.lng}]</p>
        {
            props.device &&
            <p>you: [{props.device.lat}, {props.device.lng}]</p>
        }
        <p title="degrees clockwise from north">heading: {props.heading}</p>
        <p>map center: [{props.center.lat}, {props.center.lng}]</p>
    </div>
);