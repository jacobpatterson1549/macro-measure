import './Map.css';

export const Map = ({
    heading, // the angle from north to rotate the map
    centerLatLng, // the center of the map
    itemLatLng, // the item position { name, lat, lng }
    deviceLatLng, // the current position, might be null
}) => (
    <div className="Map">
        <h3>TODO: map</h3>
        <p>{itemLatLng.name}: [{itemLatLng.lat}, {itemLatLng.lng}]</p>
        {
            deviceLatLng &&
            <p>you: [{deviceLatLng.lat}, {deviceLatLng.lng}]</p>
        }
        <p title="degrees clockwise from north">heading: {heading}</p>
        <p>map center: [{centerLatLng.lat}, {centerLatLng.lng}]</p>
    </div>
);