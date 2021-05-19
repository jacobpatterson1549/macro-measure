import { useState } from 'react';

import './Item.css';
import { Map } from './Map';
import { getDistanceHeading, moveLatLngTo, Heading } from './LocationUtils';
import { useLocalStorage } from './LocalStorage';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, Input, NameInput } from './Input';

const newItem = (currentLatLng) => {
    const lat = currentLatLng ? currentLatLng.lat : 0;
    const lng = currentLatLng ? currentLatLng.lng : 0;
    const item = {
        name: '[New Item]',
        lat: lat,
        lng: lng,
    };
    return item;
};

export const Item = ({
    view, // the page being viewed
    index, // the index of the item being shown
    items, // the items in the group
    distanceUnit, // the distance length
    createStart, // function called to create a new item
    createEnd, // (name, lat, lng): function called to create an item
    read, //(delta): function called to read the item at the offset from the index
    readItems, // function called to go back to the item list
    disableGeolocation, // function to indicate that the device does not support gps location
    updateStart, // function to begin updating the item
    updateEnd, // function to finish updating the item
    deleteStart, // function to begin deleting the item
    deleteEnd, // function to finish deleting the item
}) => {

    const [currentLatLng, setCurrentLatLng] = useLocalStorage('currentLatLng', null);
    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);
    const [item, setItem] = useState((view === 'item-create') ? newItem(currentLatLng) : items[index]);

    const _createStart = () => {
        setItem(newItem(currentLatLng));
        createStart();
    };
    const _createEnd = () => {
        createEnd(item.name, item.lat, item.lng);
    };
    const _read = (delta) => {
        setItem(items[index + delta]);
        read(index + delta);
    };
    const _updateStart = () => {
        setItem(items[index]);
        updateStart(index);
    };
    const _updateEnd = () => {
        updateEnd(index, item.name, item.lat, item.lng);
    };
    const _deleteStart = () => {
        setItem(items[index]);
        deleteStart(index);
    };
    const _deleteEnd = () => {
        deleteEnd(index);
    };

    const getHeader = () => {
        return (
            <div className="Item-Header">
                <div className="row">
                    <button className="left arrow"
                        disabled={index <= 0}
                        onClick={() => _read(-1)}
                        title="previous item"
                    >
                        <span>◀</span>
                    </button>
                    <button onClick={() => readItems()} title="items list" className="name">
                        <span>{view === 'item-create' ? '[Add Item]' : items[index].name}</span>
                    </button>
                    <button className="right arrow"
                        disabled={index + 1 >= items.length}
                        onClick={() => _read(+1)}
                        title="next item"
                    >
                        <span>▶</span>
                    </button>
                </div>
                {
                    view === 'item-read' &&
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
                            disabled={currentLatLng === null}
                            onClick={_createStart}
                            title="create item"
                        >
                            <span>Add...</span>
                        </button>
                    </div>
                }
            </div>
        );
    };

    const updateLatLng = (event, heading) => {
        event.preventDefault(); // TODO: use an input from Input.js - also do this in Settings.js
        const item2 = moveLatLngTo(item, moveAmount, distanceUnit, heading);
        const item3 = Object.assign({}, item, item2);
        setItem(item3);
    };
    const updateMoveAmount = (event) => {
        const moveAmount = event.target.value;
        setMoveAmount(moveAmount);
    };
    const cancelButton = () => {
        const onClick = (view === 'item-create') ? readItems : () => _read(0);
        return (<input type="button" value="cancel" onClick={onClick} />);
    };

    const getAction = (distanceHeading) => {
        switch (view) {
            case "item-no-geo":
                return (
                    <span>Cannot get location</span>
                );
            case "item-create":
            case "item-update":
                return (
                    <Form onSubmit={(view === 'item-create') ? _createEnd : _updateEnd}>
                        <fieldset>
                            <legend>
                                {(view === 'item-create') ? 'Create Item' : ('Update ' + items[index].name)}
                            </legend>
                            <label>
                                <span>Name</span>
                                <NameInput
                                    value={item ? item.name : '?'}
                                    values={items}
                                    onChange={(name) => setItem(Object.assign({}, item, { name: name }))}
                                    isUniqueName={(view === 'item-update') ? index : -1}
                                />
                            </label>
                            <label>
                                <span>Latitude</span>
                                <button onClick={(event) => updateLatLng(event, Heading.N)}>+(N)</button>
                                <button onClick={(event) => updateLatLng(event, Heading.S)}>-(S)</button>
                                <input type="number" value={item ? item.lat : 0} disabled />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <button onClick={(event) => updateLatLng(event, Heading.W)}>-(W)</button>
                                <button onClick={(event) => updateLatLng(event, Heading.E)}>+(E)</button>
                                <input type="number" value={item ? item.lng : 0} disabled />
                            </label>
                            <label>
                                <span>Move Amount ({distanceUnit})</span>
                                <Input type="number" value={moveAmount} onChange={updateMoveAmount} min="0" max="1000" />
                            </label>
                            <div>
                                {cancelButton()}
                                <SubmitInput
                                    disabled={view === 'item-create' && currentLatLng === null}
                                    value={(view === 'item-create') ? 'Create Item' : 'Update Item'}
                                />
                            </div>
                        </fieldset>
                    </Form>
                );
            case "item-delete":
                return (
                    <Form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {item.name}</legend>
                            <div>
                                {cancelButton()}
                                <SubmitInput value={"Delete item"} />
                            </div>
                        </fieldset>
                    </Form>
                );
            default:
            case "item-read":
                if (currentLatLng === null) {
                    return (
                        <span>Getting location...</span>
                    );
                }
                return (
                    <div className="distance">
                        <span>{distanceHeading ? distanceHeading.distance : '?'}</span>
                        <span> {distanceUnit}</span>
                    </div>
                );
        }
    };

    const distanceHeading = (view === 'item-read' && currentLatLng !== null)
        ? getDistanceHeading(item, currentLatLng, distanceUnit)
        : null;

    return (
        <div className="Item">
            <Geolocation
                view={view}
                newItem={newItem}
                setItem={setItem}
                setCurrentLatLng={setCurrentLatLng}
                disable={disableGeolocation}
            />
            {getHeader()}
            <Map
                itemLatLng={item}
                currentLatLng={currentLatLng}
                distanceHeading={distanceHeading}
                distanceUnit={distanceUnit}
            />
            {getAction(distanceHeading)}
        </div>
    );
};