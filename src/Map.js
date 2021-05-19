import './Map.css';

export const Map = ({
    heading, // the angle from north to rotate the map
    centerLatLng, // the center of the map
    itemLatLng, // the item position { name, lat, lng }
    currentLatLng, // the current position, might be null
}) => (
    <div className="Map">
        <h3>TODO: map</h3>
        <p>center map at [{centerLatLng.lat}, {centerLatLng.lng}]</p>
        <p>heading (degrees clockwise from north): {heading}</p>
        <p>{itemLatLng.name}: [{itemLatLng.lat}, {itemLatLng.lng}]</p>
        {
            currentLatLng &&
            <p>you: [{currentLatLng.lat}, {currentLatLng.lng}]</p>
        }
    </div>
);