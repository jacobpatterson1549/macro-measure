import { useEffect, useState } from 'react';

import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, Input, NameInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/Geolocation';
import { View } from '../utils/View';

export const newItem = (latLng) => {
    const lat = latLng ? latLng.lat : '[current]';
    const lng = latLng ? latLng.lng : '[current]';
    const item = {
        name: '[New Item]',
        lat: lat,
        lng: lng,
    };
    return item;
};

export const Item = ({
    view, // the page being viewed
    items, // the items in the group
    index, // the index of the item being shown
    name, // the name of the item at the index
    lat, // the lat of the item at the index
    lng, // the lng of the item at the index
    distanceUnit, // the distance length between positions
    highAccuracyGPS, // enables the GPS to be more precise
    createStart, // function called to create a new item
    createEnd, // (name, lat, lng): function called to create an item
    read, // function called to read the item at the specified index
    readItems, // function called to go back to the item list
    updateStart, // function to begin updating the item
    updateEnd, // function to finish updating the item
    deleteStart, // function to begin deleting the item
    deleteEnd, // function to finish deleting the item
}) => {

    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);
    const [formName, setFormName] = useState(name);
    const [formLat, setFormLat] = useState(lat);
    const [formLng, setFormLng] = useState(lng);
    useEffect(() => setFormName(name), [name]);
    useEffect(() => setFormLat(lat), [lat]);
    useEffect(() => setFormLng(lng), [lng]);

    const _createStart = () => {
        createStart();
    };
    const _createEndFn = (latLng) => () => {
        createEnd(formName, latLng.lat, latLng.lng);
    };
    const _read = (delta) => {
        read(index + delta);
    };
    const _updateStart = () => {
        updateStart(index);
    };
    const _updateEnd = () => {
        updateEnd(index, formName, formLat, formLng);
    };
    const _deleteStart = () => {
        deleteStart(index);
    };
    const _deleteEnd = () => {
        deleteEnd(index);
    };

    const _updateName = (name) => {
        setFormName(name)
    };
    const _updateLatLng = (heading) => () => {
        const formLatLng = moveLatLngTo({ lat: formLat, lng: formLng }, moveAmount, distanceUnit, heading);
        setFormLat(formLatLng.lat);
        setFormLng(formLatLng.lng);
    };
    const _updateMoveAmount = (event) => {
        const value = event.target.value;
        setMoveAmount(value || 1);
    };

    const getHeader = (latLng) => {
        const _prevDisabled = index <= 0;
        const _prevClick = () => _read(-1);
        const _caption = (view === View.Item_Create) ? '[Add Item]' : name;
        const _nextDisabled = !items || index + 1 >= items.length
        const _nextClick = () => _read(+1);
        const _showEdit = (view === View.Item_Read);
        const _addDisabled = (latLng === null);
        return (
            <>
                <div className="row">
                    <button className="left arrow"
                        disabled={_prevDisabled}
                        onClick={_prevClick}
                        title="previous item"
                    >
                        <span>◀</span>
                    </button>
                    <button onClick={readItems} title="items list" className="name">
                        <span>{_caption}</span>
                    </button>
                    <button className="right arrow"
                        disabled={_nextDisabled}
                        onClick={_nextClick}
                        title="next item"
                    >
                        <span>▶</span>
                    </button>
                </div>
                {
                    _showEdit &&
                    <div className="row">
                        <button
                            onClick={_updateStart}
                            title="edit item"
                        >
                            <span>Edit...</span>
                        </button>
                        <button
                            onClick={_deleteStart}
                            title="delete item"
                        >
                            <span>Delete...</span>
                        </button>
                        <button
                            disabled={_addDisabled}
                            onClick={() => _createStart(latLng)}
                            title="create item"
                        >
                            <span>Add...</span>
                        </button>
                    </div>
                }
            </>
        );
    };

    const getMap = (distanceHeading, latLng, hasGeolocation) => {
        if (!hasGeolocation) {
            return (<p>[Map disabled]</p>);
        }
        const [itemLat, itemLng]
            = (view === View.Item_Create) ? (latLng ? [latLng.lat, latLng.lng] : [null, null])
            : (view === View.Item_Update) ? [formLat, formLng]
            : [lat, lng];
        const itemLatLng = { lat: itemLat, lng: itemLng };
        const [heading, centerLatLng, deviceLatLng] = (distanceHeading)
            ? [distanceHeading.heading, moveLatLngTo(itemLatLng, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading), latLng]
            : [0, itemLatLng, null];
        return (
            <Map
                heading={heading}
                centerLatLng={centerLatLng}
                name={name}
                lat={itemLat}
                lng={itemLng}
                deviceLatLng={deviceLatLng}
            />
        );
    };

    const getAction = (distanceHeading, latLng, hasGeolocation) => {
        if (!hasGeolocation) {
            return (<span>Cannot get location</span>);
        }
        switch (view) {
            case View.Item_Create:
            case View.Item_Update:
                const [_onSubmit, _disabled, _updateLatLngDisabled, _caption, _updateIndex, _cancel, _submitValue] = (view === View.Item_Create)
                    // TODO: cancel for View.Item_Create should be similar to when delete is successful
                    ? [_createEndFn(latLng), !latLng, true, 'Create Item', -1, readItems, 'Create Item']
                    : [_updateEnd, false, false, ('Update ' + name), index, () => _read(0), 'Update Item'];
                return (
                    <Form onSubmit={_onSubmit}>
                        <fieldset disabled={_disabled}>
                            <legend>{_caption}</legend>
                            <label>
                                <span>Name</span>
                                <NameInput
                                    value={formName}
                                    values={items}
                                    onChange={_updateName}
                                    updateIndex={_updateIndex}
                                />
                            </label>
                            <label>
                                <span>Latitude</span>
                                <ButtonInput onClick={_updateLatLng(Heading.N)} value="+(N)" disabled={_updateLatLngDisabled} />
                                <ButtonInput onClick={_updateLatLng(Heading.S)} value="-(S)" disabled={_updateLatLngDisabled} />
                                <input type="text" value={formLat} disabled title="latitude" />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <ButtonInput onClick={_updateLatLng(Heading.W)} value="-(W)" disabled={_updateLatLngDisabled} />
                                <ButtonInput onClick={_updateLatLng(Heading.E)} value="+(E)" disabled={_updateLatLngDisabled} />
                                <input type="text" value={formLng} disabled title="longitude" />
                            </label>
                            <label>
                                <span>Move Amount ({distanceUnit})</span>
                                <Input type="number" value={moveAmount} onChange={_updateMoveAmount} min="0" max="1000" required={true} />
                            </label>
                            <div>
                                <ButtonInput value="cancel" onClick={_cancel} />
                                <SubmitInput value={_submitValue} />
                            </div>
                        </fieldset>
                    </Form>
                );
            case View.Item_Delete:
                const _cancelDelete = () => _read(0);
                return (
                    <Form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {name}</legend>
                            <div>
                                <ButtonInput value="Cancel" onClick={_cancelDelete} />
                                <SubmitInput value={"Delete item"} />
                            </div>
                        </fieldset>
                    </Form>
                );
            case View.Item_Read:
            default:
                if (!latLng) {
                    return (
                        <span>Getting location...</span>
                    );
                }
                const _distance = (distanceHeading) ? String(distanceHeading.distance) : '?';
                return (
                    <div className="distance">
                        <span>{_distance}</span>
                        <span> {distanceUnit}</span>
                    </div>
                );
        }
    };

    return (
        <Geolocation
            view={view}
            highAccuracyGPS={highAccuracyGPS}
            render={geolocation => {

                const distanceHeading = (view === View.Item_Read && geolocation.latLng !== null)
                    ? getDistanceHeading({ lat: lat, lng: lng }, geolocation.latLng, distanceUnit)
                    : null;

                return (
                    <div className="Item">
                        <div className="Item-Header">
                            {getHeader(geolocation.latLng)}
                        </div>
                        <div role="img">
                            {getMap(distanceHeading, geolocation.latLng, geolocation.valid)}
                        </div>
                        <div>
                            {getAction(distanceHeading, geolocation.latLng, geolocation.valid)}
                        </div>
                    </div>
                );
            }} />
    );
};