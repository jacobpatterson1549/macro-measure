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
    const prevDisabled = index <= 0;
    const headerName = (view === View.Item_Create) ? '[Add Item]' : name;
    const nextDisabled = !items || index + 1 >= items.length
    const showEdit = (view === View.Item_Read);
    return (
        <>
            <div className="row">
                <button className="left arrow"
                    disabled={prevDisabled}
                    onClick={handleRead(read, index, -1)}
                    title="previous item"
                >
                    <span>◀</span>
                </button>
                <button onClick={readItems} title="items list" className="name">
                    <span>{headerName}</span>
                </button>
                <button className="right arrow"
                    disabled={nextDisabled}
                    onClick={handleRead(read, index, +1)}
                    title="next item"
                >
                    <span>▶</span>
                </button>
            </div>
            {
                showEdit &&
                <div className="row">
                    <button
                        onClick={handleUpdateStart(updateStart, index)}
                        title="edit item"
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        onClick={handleDeleteStart(deleteStart, index)}
                        title="delete item"
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        onClick={handleCreateStart(createStart)}
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
            const [handleSubmit, submitDisabled, updateLatLngDisabled, actionName, updateIndex, handleCancel, submitValue] = (view === View.Item_Create)
                ? [handleCreateEnd(createEnd, formName, latLng), !latLng, true, 'Create Item', -1, readItems, 'Create Item']
                : [handleUpdateEnd(updateEnd, index, formName, formLat, formLng), false, false, ('Update ' + name), index, handleRead(read, index, 0), 'Update Item'];
            return (
                <Form onSubmit={handleSubmit}>
                    <fieldset disabled={submitDisabled}>
                        <legend>{actionName}</legend>
                        <label>
                            <span>Name</span>
                            <NameInput
                                value={formName}
                                values={items}
                                onChange={setFormName}
                                updateIndex={updateIndex}
                            />
                        </label>
                        <label>
                            <span>Latitude</span>
                            <ButtonInput onClick={handleUpdateLatLng(Heading.N, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="+(N)" disabled={updateLatLngDisabled} />
                            <ButtonInput onClick={handleUpdateLatLng(Heading.S, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="-(S)" disabled={updateLatLngDisabled} />
                            <TextInput value={formLat} disabled />
                        </label>
                        <label>
                            <span>Longitude</span>
                            <ButtonInput onClick={handleUpdateLatLng(Heading.W, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="-(W)" disabled={updateLatLngDisabled} />
                            <ButtonInput onClick={handleUpdateLatLng(Heading.E, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit)} value="+(E)" disabled={updateLatLngDisabled} />
                            <TextInput value={formLng} disabled />
                        </label>
                        <label>
                            <span>Move Amount ({distanceUnit})</span>
                            <NumberInput value={moveAmount} onChange={setMoveAmount} min="0" max="1000" />
                        </label>
                        <div>
                            <ButtonInput value="cancel" onClick={handleCancel} />
                            <SubmitInput value={submitValue} />
                        </div>
                    </fieldset>
                </Form>
            );
        case View.Item_Delete:
            return (
                <Form onSubmit={handleDeleteEnd(deleteEnd, index)}>
                    <fieldset>
                        <legend>Delete {name}</legend>
                        <div>
                            <ButtonInput value="Cancel" onClick={handleRead(read, index, 0)} />
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
            return (
                <div className="distance">
                    <span>{String(distanceHeading.distance)}</span>
                    <span> {distanceUnit}</span>
                </div>
            );
    }
};

const handleCreateStart = (createStart) => () => createStart();

const handleCreateEnd = (createEnd, formName, latLng) => () => createEnd(formName, latLng.lat, latLng.lng);

const handleRead = (read, index, delta) => () => read(index + delta);

const handleUpdateStart = (updateStart, index) => () => updateStart(index);

const handleUpdateEnd = (updateEnd, index, formName, formLat, formLng) => () => updateEnd(index, formName, formLat, formLng);

const handleDeleteStart = (deleteStart, index) => () => deleteStart(index);

const handleDeleteEnd = (deleteEnd, index) => () => deleteEnd(index);

const handleUpdateLatLng = (heading, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit) => () => {
    const formLatLng = moveLatLngTo({ lat: formLat, lng: formLng }, moveAmount, distanceUnit, heading);
    setFormLat(formLatLng.lat);
    setFormLng(formLatLng.lng);
};