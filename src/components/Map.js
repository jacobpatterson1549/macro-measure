import './Map.css';

import { moveLatLngTo } from '../utils/Geolocation';

export const Map = ({ item, device, distanceHeading, distanceUnit }) => {
    const center = device
        ? moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading)
        : item;
    return render(item, device, center, distanceHeading?.heading || 0);
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