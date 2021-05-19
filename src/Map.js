import './Map.css';
import { moveLatLngTo } from './LocationUtils';

export const Map = ({
    itemLatLng, // the item position { name, lat, lng }
    currentLatLng, // the current position, only shown distanceHeading is not null { lat, lng }
    distanceHeading, // the distance and heading between item and current: { distance , heading };
    distanceUnit, // the distance length
}) => {

    // const [showMap, setShowMap] = useLocalStorage('show-map', true); // TODO: allow this to be set
    const showMap = true;
    if (!showMap) {
        return (<p>[Map disabled]</p>);
    }
    const heading = (distanceHeading)
        ? distanceHeading.heading
        : 0;
    const centerLatLng = (distanceHeading)
        ? moveLatLngTo(itemLatLng, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading)
        : itemLatLng;

    return (
        <div className="Map">
            <h3>TODO: map</h3>
            <p>center map at [{centerLatLng.lat}, {centerLatLng.lng}]</p>
            <p>heading: {heading}</p>
            <p>{itemLatLng.name}: [{itemLatLng.lat}, {itemLatLng.lng}]</p>
            {
                distanceHeading &&
                <p>you: [{currentLatLng.lat}, {currentLatLng.lng}]</p>
            }
        </div>
    );
};