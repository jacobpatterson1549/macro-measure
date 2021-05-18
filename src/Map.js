import { Loader } from "@googlemaps/js-api-loader"

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
    const key = process.env.REACT_APP_GOOGLE_MAPS_JAVASCRIPT_API_KEY;
    if (!key) {
        return (<p>REACT_APP_GOOGLE_MAPS_JAVASCRIPT_API_KEY environment variable missing</p>);
    }
    const heading = (distanceHeading)
        ? distanceHeading.heading
        : 0;
    const centerLatLng = (distanceHeading)
        ? moveLatLngTo(itemLatLng, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading)
        : itemLatLng;

    const initMap = () => {
        const google = window.google;
        const mapDiv = document.getElementById("map");
        const mapOptions = {
            zoom: 16, // TODO: compute zoom relative to distance/distanceUnit/moveAmount
            center: centerLatLng,
            heading: heading,
        };
        const markers = [
            new google.maps.Marker({
                position: itemLatLng,
                title: itemLatLng.name,
            }),
        ];
        if (distanceHeading) {
            markers.push(new google.maps.Marker({
                position: currentLatLng,
                title: 'you',
            }));
        }
        const map = new google.maps.Map(mapDiv, mapOptions);
        markers.map((marker) => marker.setMap(map));
    };
    const loader = new Loader({ // TODO: investigate normal js loading without dependency
        apiKey: key,
        version: 'weekly',
    });
    // loader.load().then(initMap); // TODO: enable map

    const googleMapURL = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap&libraries=&v=weekly`;
    return (
        <div className="Map">
            <div id="map"></div>
            <script async src={googleMapURL}></script>
        </div>
    );
};