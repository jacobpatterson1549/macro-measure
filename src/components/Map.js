import './Map.css';

// TODO: Map arguments should be {item, device, heading}.  This component should calculate the center if the device field is non-null.
export const Map = ({ heading, centerLatLng, name, lat, lng, deviceLatLng }) => (
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