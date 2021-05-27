import './Map.css';

export const Map = ({
    heading, // the angle from north to rotate the map
    centerLatLng, // the center of the map
    name, // the item name
    lat, // the item latitude
    lng, // the item longitude
    deviceLatLng, // the current position, might be null
}) => (
    <div className="Map">
        <h3>TODO: map</h3>
        <p>{name}: [{lat}, {lng}]</p>
        {
            deviceLatLng &&
            <p>you: [{deviceLatLng.lat}, {deviceLatLng.lng}]</p>
        }
        <p title="degrees clockwise from north">heading: {heading}</p>
        <p>map center: [{centerLatLng.lat}, {centerLatLng.lng}]</p>
    </div>
);