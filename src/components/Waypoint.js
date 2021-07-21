import { useState, useEffect } from 'react';

import './Waypoint.css';

import { Map } from './Map';
import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useLocalStorage } from '../hooks/LocalStorage';
import { useGeolocation } from '../hooks/Geolocation';

import { View } from '../utils/View';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/Geolocation';

export const Waypoint = (props) => {
    const geolocation = useGeolocation(props.view, props.highAccuracyGPS, props.setGPSOn);
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?'); // same name as NameList.js
    const [latInput, setLatInput] = useLocalStorage(`${props.type}InputLat`, 0);
    const [lngInput, setLngInput] = useLocalStorage(`${props.type}InputLng`, 0);
    const [moveAmountInput, setMoveAmountInput] = useLocalStorage('moveAmountInput', 1);
    const [mapItem, setMapItem] = useState(null);
    const [mapDevice, setMapDevice] = useState(null);
    const [distanceHeading, setDistanceHeading] = useState(null);
    useEffect(() => {
        if (props.item) {
            setNameInput(props.item.name);
            setLatInput(props.item.lat);
            setLngInput(props.item.lng);
        }
    }, [props.item, setNameInput, setLatInput, setLngInput]);
    useEffect(() => {
        const distanceHeading2 = (View.isRead(props.view) && geolocation.lat && geolocation.lng && props.item && props.item.lat && props.item.lng)
            ? getDistanceHeading(
                { lat: props.item.lat, lng: props.item.lng },
                { lat: geolocation.lat, lng: geolocation.lng },
                props.distanceUnit)
            : null;
        setDistanceHeading(distanceHeading2);
    }, [setDistanceHeading, props.view, geolocation.lat, geolocation.lng, props.item, props.distanceUnit]);
    useEffect(() => {
        const mapItem2 = (View.isCreate(props.view) && geolocation.lat && geolocation.lng)
            ? { name: 'Waypoint', lat: geolocation.lat, lng: geolocation.lng }
            : props.item
        setMapItem(mapItem2);
    }, [setMapItem, props.item, props.view, geolocation.lat, geolocation.lng]);
    useEffect(() => {
        const mapDevice2 = (geolocation.valid && distanceHeading && geolocation.lat && geolocation.lng)
            ? { lat: geolocation.lat, lng: geolocation.lng }
            : null;
        setMapDevice(mapDevice2);
    }, [setMapDevice, geolocation.valid, geolocation.lat, geolocation.lng, distanceHeading]);

    const state = {
        moveAmountInput, setMoveAmountInput,
        nameInput, setNameInput,
        latInput, setLatInput,
        lngInput, setLngInput,
        mapItem, mapDevice,
        geolocation, distanceHeading,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <>
        <div className="Waypoint-Map" role="img">
            {getMap(props)}
        </div>
        <div className="Waypoint-Form">
            {getAction(props)}
        </div>
    </>
);

const getAction = (props) => (
    (!props.geolocation.valid)
        ? (<span>Cannot get location</span>)
        : (actions[props.view] || getReadAction)(props)
);

const getMap = (props) => {
    const getMapHelper = () => (
        (!props.mapItem || !props.mapItem.lat || !props.mapItem.lng)
            ? (<p>Waiting for GPS...</p>)
            : (
                <Map
                    item={props.mapItem}
                    device={props.mapDevice}
                    accuracy={props.geolocation.accuracy}
                    distanceHeading={props.distanceHeading}
                    distanceUnit={props.distanceUnit}
                />
            )
    );
    return (!props.geolocation.valid)
        ? (<p>[Map disabled]</p>)
        : getMapHelper();
};

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateID, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), props.geolocation.lat && props.geolocation.lng, true, `Create ${props.type}`, null, handleReadList(props), `Create ${props.type}`]
        : [handleUpdateEnd(props), true, false, `Update ${props.item?.name}`, props.item?.id, handleRead(props), `Update ${props.type}`];
    return (
        <Form
            submitValue={submitValue}
            submitDisabled={!hasLatLng}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
        >
            <Fieldset caption={actionName}>
                <Label caption="Name">
                    <NameInput
                        value={props.nameInput}
                        values={props.items}
                        updateID={updateID}
                        onChange={props.setNameInput}
                    />
                </Label>
                <Fieldset disabled={!hasLatLng} border={false}>
                    <Label caption="Latitude">
                        {getMoveLatLngButton(Heading.S, '-(S)', updateLatLngDisabled, props)}
                        {getMoveLatLngButton(Heading.N, '+(N)', updateLatLngDisabled, props)}
                        <TextInput
                            value={props.lat}
                            disabled
                        />
                    </Label>
                    <Label caption="Longitude">
                        {getMoveLatLngButton(Heading.W, '-(W)', updateLatLngDisabled, props)}
                        {getMoveLatLngButton(Heading.E, '+(E)', updateLatLngDisabled, props)}
                        <TextInput
                            value={props.lng}
                            disabled
                        />
                    </Label>
                    <Label caption={`Move Amount (${props.distanceUnit})`}>
                        <NumberInput
                            value={props.moveAmountInput}
                            min="0"
                            max="1000"
                            onChange={props.setMoveAmountInput}
                        />
                    </Label>
                </Fieldset>
            </Fieldset>
        </Form>
    );
}

const getDeleteAction = (props) => (
    <Form
        submitValue={`Delete ${props.type}`}
        onCancel={handleRead(props)}
        onSubmit={handleDeleteEnd(props)}
    >
        <Fieldset caption={`Delete ${props.item?.name}`} />
    </Form>
);

const getReadAction = (props) => (
    (props.distanceHeading)
        ? (
            <div className="distance">
                <span>{String(props.distanceHeading.distance)}</span>
                <span className="unit"> {props.distanceUnit}</span>
            </div>
        )
        : (
            <span>Getting location...</span>
        )
);

const getMoveLatLngButton = (heading, value, disabled, { moveAmount: moveAmountInput, latInput, lngInput, setLatInput, setLngInput, distanceUnit }) => (
    <ButtonInput
        value={value}
        disabled={disabled}
        onClick={handleUpdateLatLng(heading, moveAmountInput, latInput, setLatInput, lngInput, setLngInput, distanceUnit)}
    />
);

const handleCreateEnd = ({ createEnd, nameInput, geolocation, parentItemID, reloadItems }) => async () => {
    const item2 = {
        name: nameInput,
        lat: geolocation.lat, // create with current position
        lng: geolocation.lng,
        parentItemID: parentItemID,
    }
    await createEnd(item2);
    reloadItems();
};

const handleRead = ({ read, item }) => () => {
    read(item);
};

const handleReadList = ({ list }) => () => {
    list();
};

const handleUpdateEnd = ({ updateEnd, item, nameInput, latInput, lngInput, reloadItems, }) => () => {
    const item2 = Object.assign({}, item, {
        name: nameInput,
        lat: latInput,
        lng: lngInput,
    });
    updateEnd(item2);
    reloadItems();
};

const handleDeleteEnd = ({ deleteEnd, item, reloadItems, }) => () => {
    deleteEnd(item);
    reloadItems();
};

const handleUpdateLatLng = (heading, moveAmountInput, latInput, setLatInput, lngInput, setLngInput, distanceUnit) => () => {
    const latLng = {
        lat: latInput,
        lng: lngInput,
    };
    const latLng2 = moveLatLngTo(latLng, moveAmountInput, distanceUnit, heading);
    setLatInput(latLng2.lat);
    setLngInput(latLng2.lng);
};

const actions = Object.fromEntries(
    View.AllIDs
        .filter((viewID) => View.isCreate(viewID) || View.isUpdate(viewID) || View.isDelete(viewID))
        .map((viewID) => [viewID, View.isDelete(viewID) ? getDeleteAction : getCreateOrUpdateAction]));