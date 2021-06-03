import './Map.css';

import { moveLatLngTo } from '../utils/Geolocation';

export const Map = ({ item, device, distanceHeading, distanceUnit }) => {
    const [center, heading] = (device && distanceHeading)
        ? [moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading), distanceHeading.heading]
        : [item, 0];
    return render(item, device, center, heading);
};

const render = (item, device, center, heading) => (
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