import { useState } from 'react';

import './Item.css';
import { Map } from './Map';
import { getDistanceHeading, moveLatLngTo, Heading } from './LocationUtils';
import { useLocalStorage } from './LocalStorage';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, Input, NameInput, ButtonInput } from './Form';

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
    distanceUnit, // the distance length between positions
    highAccuracyGPS, // enables the GPS to be more precise
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

    const updateLatLng = (heading) => {
        const item2 = moveLatLngTo(item, moveAmount, distanceUnit, heading);
        const item3 = Object.assign({}, item, item2);
        setItem(item3);
    };
    const updateMoveAmount = (event) => {
        const moveAmount = event.target.value;
        setMoveAmount(moveAmount);
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
                                <ButtonInput onClick={() => updateLatLng(Heading.N)} value="+(N)" />
                                <ButtonInput onClick={() => updateLatLng(Heading.S)} value="-(S)" />
                                <input type="number" value={item ? item.lat : 0} disabled />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <ButtonInput onClick={() => updateLatLng(Heading.W)} value="-(W)" />
                                <ButtonInput onClick={() => updateLatLng(Heading.E)} value="+(E)" />
                                <input type="number" value={item ? item.lng : 0} disabled />
                            </label>
                            <label>
                                <span>Move Amount ({distanceUnit})</span>
                                <Input type="number" value={moveAmount} onChange={updateMoveAmount} min="0" max="1000" />
                            </label>
                            <div>
                                <ButtonInput value="cancel" onClick={(view === 'item-create') ? readItems : () => _read(0)} />
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
                                <ButtonInput value="Cancel" onClick={() => _read(0)} />
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

    const getMap = (distanceHeading) => {
        // const [showMap, setShowMap] = useLocalStorage('show-map', true); // TODO: allow this to be set
        const showMap = true;
        if (!showMap) {
            return (<p>[Map disabled]</p>);
        }
        const heading = (distanceHeading)
            ? distanceHeading.heading
            : 0;
        const centerLatLng = (distanceHeading)
            ? moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading)
            : item;
        const currentLatLng2 = (distanceHeading)
            ? currentLatLng
            : null;
        return (
            <Map
                heading={heading}
                centerLatLng={centerLatLng}
                itemLatLng={item}
                currentLatLng={currentLatLng2}
            />
        );
    }

    const distanceHeading = (view === 'item-read' && currentLatLng !== null)
        ? getDistanceHeading(item, currentLatLng, distanceUnit)
        : null;

    return (
        <div className="Item">
            <Geolocation
                view={view}
                highAccuracyGPS={highAccuracyGPS}
                newItem={newItem}
                setItem={setItem}
                setCurrentLatLng={setCurrentLatLng}
                disable={disableGeolocation}
            />
            {getHeader()}
            {getMap(distanceHeading)}
            {getAction(distanceHeading)}
        </div>
    );
};