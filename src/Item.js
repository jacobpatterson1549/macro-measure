import { useEffect, useState } from 'react';

import './Item.css'
import { Map } from './Map'
import { GetDistanceHeading, MoveTo, Heading } from './LocationUtils'
import { useLocalStorage } from './LocalStorage';

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

const needsLocation = (view) => ['item-read', 'item-create'].includes(view);

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

    const canGetGeolocation = navigator.geolocation;
    const [currentLatLng, setCurrentLatLong] = useLocalStorage('currentLatLng', null);
    const [item, setItem] = useState((view === 'item-create') ? newItem(currentLatLng) : items[index])
    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);

    let timerID;
    const stopGeoTimer = () => {
        console.log('stopping timer', timerID, new Date());
        clearInterval(timerID);
    };
    const startGeoTimer = () => {
        if (needsLocation(view)) {
            if (!canGetGeolocation) {
                return;
            }
            const success = (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const latLng = { lat: latitude, lng: longitude };
                if (view === 'item-create' && currentLatLng === null) {
                    setItem(newItem(latLng));
                }
                setCurrentLatLong(latLng);
                console.log('got location', latLng);
                if (view !== 'item-read') {
                    stopGeoTimer();
                }
            };
            const error = disableGeolocation;
            const options = {
                enableHighAccuracy: false, // TODO: allow this to be a setting
            };
            stopGeoTimer();
            timerID = navigator.geolocation.watchPosition(success, error, options);
            console.log('STARTING timer', timerID, new Date());
        }
    };
    useEffect(() => {
        if (needsLocation(view)) {
            if (canGetGeolocation) {
                startGeoTimer();
            } else {
                disableGeolocation();
            }
        }
        return stopGeoTimer;
    });

    const _createStart = () => {
        setItem(newItem(currentLatLng));
        createStart();
    };
    const _createEnd = (event) => {
        event.preventDefault();
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
    const _updateEnd = (event) => {
        event.preventDefault();
        updateEnd(index, item.name, item.lat, item.lng);
    };
    const _deleteStart = () => {
        setItem(items[index]);
        deleteStart(index);
    };
    const _deleteEnd = (event) => {
        event.preventDefault();
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

    // TODO: much of this is duplicated in NameTable.js
    const uniqueName = (name) => {
        for (let i = 0; i < items.length; i++) {
            const otherItem = items[i]
            if (name === otherItem.name && (view !== 'item-update' || i === index)) {
                return false;
            }
        }
        return true;
    };
    const updateName = (event) => {
        const name = event.target.value;
        const isUniqueName = uniqueName(name);
        const nameInput = event.target;
        const item2 = Object.assign({}, item, { name: name });
        nameInput.setCustomValidity(isUniqueName ? '' : 'duplicate name');
        setItem(item2);
    }

    const updateLatLng = (event, heading) => {
        event.preventDefault();
        const item2 = MoveTo(item, moveAmount, distanceUnit, heading);
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

    const getAction = () => {
        switch (view) {
            case "item-no-geo":
                return (
                    <span>Cannot get location</span>
                );
            case "item-create":
            case "item-update":
                return (
                    <form onSubmit={(view === 'item-create') ? _createEnd : _updateEnd}>
                        <fieldset>
                            <legend>
                                {(view === 'item-create') ? 'Create Item' : ('Update ' + items[index].name)}
                            </legend>
                            <label>
                                <span>Name</span>
                                <input type="text" value={item ? item.name : '?'} onChange={updateName} onFocus={(event) => event.target.select()} />
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
                                <input type="number" value={moveAmount} onChange={updateMoveAmount} min="0" max="1000" onFocus={(event) => event.target.select()} />
                            </label>
                            <div>
                                {cancelButton()}
                                <input type="submit"
                                    disabled={view === 'item-create' && currentLatLng === null}
                                    value={(view === 'item-create') ? 'Create Item' : 'Update Item'}
                                />
                            </div>
                        </fieldset>
                    </form>
                );
            case "item-delete":
                return (
                    <form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {item.name}</legend>
                            <div>
                                {cancelButton()}
                                <input type="submit" value={"Delete item"} />
                            </div>
                        </fieldset>
                    </form>
                );
            default:
            case "item-read":
                if (currentLatLng == null) {
                    return (
                        <span>Getting location...</span>
                    )
                }
                const distanceHeading = GetDistanceHeading(item, currentLatLng, distanceUnit);
                return (
                    <div className="distance">
                        <span>{distanceHeading.distance}</span>
                        <span> {distanceUnit}</span>
                    </div>
                );
        }
    }

    return (
        <div className="Item">
            {getHeader()}
            <Map />
            {getAction()}
        </div>
    );
};