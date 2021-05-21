import { useState } from 'react';

import './Item.css';
import { Map } from './Map';
import { getDistanceHeading, moveLatLngTo, Heading } from './LocationUtils';
import { useLocalStorage } from './LocalStorage';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, Input, NameInput, ButtonInput } from './Form';
import { View } from './View';

export const newItem = (currentLatLng) => {
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
    items, // the items in the group
    index, // the index of the item being shown
    defaultItem, // the item at the index
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

    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);
    const [currentLatLng, setCurrentLatLng] = useState(null);
    const [item, setItem] = useState(defaultItem);

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

    const _updateLatLng = (heading) => () => {
        const item2 = moveLatLngTo(item, moveAmount, distanceUnit, heading);
        const item3 = Object.assign({}, item, item2);
        setItem(item3);
    };
    const _updateMoveAmount = (event) => {
        const value = event.target.value;
        setMoveAmount(value || 1);
    };

    const distanceHeading = (view === View.Item_Read && currentLatLng !== null)
        ? getDistanceHeading(item, currentLatLng, distanceUnit)
        : null;

    const getHeader = () => {
        const _prevDisabled = index <= 0;
        const _prevClick = () => _read(-1);
        const _caption = (view === View.Item_Create) ? '[Add Item]' : items[index].name;
        const _nextDisabled = index + 1 >= items.length
        const _nextClick = () => _read(+1);
        const _showEdit = (view === View.Item_Read);
        const _addDisabled = (currentLatLng === null);
        return (
            <div className="Item-Header">
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

    const getMap = () => {
        if (view === View.Item_No_Geolocation) {
            return (<p>[Map disabled]</p>);
        }
        const [heading, centerLatLng, deviceLatLng] = (distanceHeading)
            ? [distanceHeading.heading, moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading), currentLatLng]
            : [0, item, null];
        return (
            <Map
                heading={heading}
                centerLatLng={centerLatLng}
                itemLatLng={item}
                deviceLatLng={deviceLatLng}
            />
        );
    };

    const getAction = () => {
        switch (view) {
            case View.Item_No_Geolocation:
                return (
                    <span>Cannot get location</span>
                );
            case View.Item_Create:
            case View.Item_Update:
                const _setName = (name) => setItem(Object.assign({}, item, { name: name }));
                const [_onSubmit, _disabled, _caption, _updateIndex, _cancel, _submitValue] = (view === View.Item_Create)
                    // TODO: cancel for View.Item_Create should be similar to when delete is successful
                    ? [_createEnd, !currentLatLng, 'Create Item', -1, readItems, 'Create Item']
                    : [_updateEnd, false, ('Update ' + items[index].name), index, () => _read(0), 'Update Item'];
                return (
                    <Form onSubmit={_onSubmit}>
                        <fieldset disabled={_disabled}>
                            <legend>{_caption}</legend>
                            <label>
                                <span>Name</span>
                                <NameInput
                                    value={item.name}
                                    values={items}
                                    onChange={_setName}
                                    updateIndex={_updateIndex}
                                />
                            </label>
                            <label>
                                <span>Latitude</span>
                                <ButtonInput onClick={_updateLatLng(Heading.N)} value="+(N)" />
                                <ButtonInput onClick={_updateLatLng(Heading.S)} value="-(S)" />
                                <input type="number" value={item.lat} disabled />
                            </label>
                            <label>
                                <span>Longitude</span>
                                <ButtonInput onClick={_updateLatLng(Heading.W)} value="-(W)" />
                                <ButtonInput onClick={_updateLatLng(Heading.E)} value="+(E)" />
                                <input type="number" value={item.lng} disabled />
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
                            <legend>Delete {item.name}</legend>
                            <div>
                                <ButtonInput value="Cancel" onClick={_cancelDelete} />
                                <SubmitInput value={"Delete item"} />
                            </div>
                        </fieldset>
                    </Form>
                );
            case View.Item_Read:
            default:
                if (!currentLatLng) {
                    return (
                        <span>Getting location...</span>
                    );
                }
                const _distance = (distanceHeading) ? distanceHeading.distance : '?';
                return (
                    <div className="distance">
                        <span>{_distance} {distanceUnit}</span>
                    </div>
                );
        }
    };

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
            {getMap()}
            {getAction()}
        </div>
    );
};