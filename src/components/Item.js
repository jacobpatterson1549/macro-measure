import { useState } from 'react';

import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/Geolocation';
import { View } from '../utils/View';

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
                            {getHeader(view, items, index, name, createStart, read, readItems, updateStart, deleteStart)}
                        </div>
                        <div role="img">
                            {getMap(
                                distanceHeading, geolocation.latLng, geolocation.valid,
                                formLat, formLng,
                                view, name, lat, lng, distanceUnit)}
                        </div>
                        <div>
                            {getAction(
                                distanceHeading, geolocation.latLng, geolocation.valid,
                                moveAmount, setMoveAmount, formName, setFormName, formLat, setFormLat, formLng, setFormLng,
                                view, items, index, name, distanceUnit, createEnd, read, readItems, updateEnd, deleteEnd)}
                        </div>
                    </div>
                );
            }} />
    );
};

export const newItem = () => ({
    name: '[New Item]',
    lat: '[current]',
    lng: '[current]',
});

const getHeader = (view, items, index, name, createStart, read, readItems, updateStart, deleteStart) => {
    const _prevDisabled = index <= 0;
    const _caption = (view === View.Item_Create) ? '[Add Item]' : name;
    const _nextDisabled = !items || index + 1 >= items.length
    const _showEdit = (view === View.Item_Read);
    return (
        <>
            <div className="row">
                <button className="left arrow"
                    disabled={_prevDisabled}
                    onClick={_read(read, index, -1)}
                    title="previous item"
                >
                    <span>◀</span>
                </button>
                <button onClick={readItems} title="items list" className="name">
                    <span>{_caption}</span>
                </button>
                <button className="right arrow"
                    disabled={_nextDisabled}
                    onClick={_read(read, index, +1)}
                    title="next item"
                >
                    <span>▶</span>
                </button>
            </div>
            {
                _showEdit &&
                <div className="row">
                    <button
                        onClick={_updateStart(updateStart, index)}
                        title="edit item"
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        onClick={_deleteStart(deleteStart, index)}
                        title="delete item"
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        onClick={_createStart(createStart)}
                        title="create item"
                    >
                        <span>Add...</span>
                    </button>
                </div>
            }
        </>
    );
};

const getMap = (
    distanceHeading, latLng, hasGeolocation,
    formLat, formLng,
    view, name, lat, lng, distanceUnit) => {
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

const getAction = (
    distanceHeading, latLng, hasGeolocation,
    moveAmount, setMoveAmount, formName, setFormName, formLat, setFormLat, formLng, setFormLng,
    view, items, index, name, distanceUnit, createEnd, read, readItems, updateEnd, deleteEnd) => {
    if (!hasGeolocation) {
        return (<span>Cannot get location</span>);
    }
    switch (view) {
        case View.Item_Create:
        case View.Item_Update:
            const [_onSubmit, _disabled, _updateLatLngDisabled, _caption, _updateIndex, _cancel, _submitValue] = (view === View.Item_Create)
                ? [_createEnd(createEnd, formName, latLng), !latLng, true, 'Create Item', -1, readItems, 'Create Item']
                : [_updateEnd(updateEnd, index, formName, formLat, formLng), false, false, ('Update ' + name), index, _read(read, index, 0), 'Update Item'];
            return (
                <Form onSubmit={_onSubmit}>
                    <fieldset disabled={_disabled}>
                        <legend>{_caption}</legend>
                        <label>
                            <span>Name</span>
                            <NameInput
                                value={formName}
                                values={items}
                                onChange={setFormName}
                                updateIndex={_updateIndex}
                            />
                        </label>
                        <label>
                            <span>Latitude</span>
                            <ButtonInput onClick={_updateLatLng(Heading.N, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="+(N)" disabled={_updateLatLngDisabled} />
                            <ButtonInput onClick={_updateLatLng(Heading.S, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="-(S)" disabled={_updateLatLngDisabled} />
                            <TextInput value={formLat} disabled />
                        </label>
                        <label>
                            <span>Longitude</span>
                            <ButtonInput onClick={_updateLatLng(Heading.W, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="-(W)" disabled={_updateLatLngDisabled} />
                            <ButtonInput onClick={_updateLatLng(Heading.E, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="+(E)" disabled={_updateLatLngDisabled} />
                            <TextInput value={formLng} disabled />
                        </label>
                        <label>
                            <span>Move Amount ({distanceUnit})</span>
                            <NumberInput value={moveAmount} onChange={setMoveAmount} min="0" max="1000" />
                        </label>
                        <div>
                            <ButtonInput value="cancel" onClick={_cancel} />
                            <SubmitInput value={_submitValue} />
                        </div>
                    </fieldset>
                </Form>
            );
        case View.Item_Delete:
            const _cancelDelete = _read(read, index, 0);
            return (
                <Form onSubmit={_deleteEnd(deleteEnd, index)}>
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
            const _distance = String(distanceHeading.distance);
            return (
                <div className="distance">
                    <span>{_distance}</span>
                    <span> {distanceUnit}</span>
                </div>
            );
    }
};

const _createStart = (createStart) => () => createStart();

const _createEnd = (createEnd, formName, latLng) => () => createEnd(formName, latLng.lat, latLng.lng);

const _read = (read, index, delta) => () => read(index + delta);

const _updateStart = (updateStart, index) => () => updateStart(index);

const _updateEnd = (updateEnd, index, formName, formLat, formLng) => () => updateEnd(index, formName, formLat, formLng);

const _deleteStart = (deleteStart, index) => () => deleteStart(index);

const _deleteEnd = (deleteEnd, index) => () => deleteEnd(index);

const _updateLatLng = (heading, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit) => () => {
    const formLatLng = moveLatLngTo({ lat: formLat, lng: formLng }, moveAmount, distanceUnit, heading);
    setFormLat(formLatLng.lat);
    setFormLng(formLatLng.lng);
};