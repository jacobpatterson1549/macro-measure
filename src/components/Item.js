import { useState } from 'react';

import './Item.css';
import { Map } from './Map';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/LocationUtils';
import { useLocalStorage } from '../utils/LocalStorage';
import { Geolocation } from './Geolocation';
import { Form, SubmitInput, Input, NameInput, ButtonInput } from './Form';
import { View } from '../utils/View';

export const newItem = (latLng) => {
    const lat = latLng ? latLng.lat : 0;
    const lng = latLng ? latLng.lng : 0;
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
    read, //(delta): function called to read the item at the offset from the index
    readItems, // function called to go back to the item list
    updateStart, // function to begin updating the item
    updateEnd, // function to finish updating the item
    deleteStart, // function to begin deleting the item
    deleteEnd, // function to finish deleting the item
}) => {

    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);
    const [item, setItem] = useState({ name: name, lat: lat, lng: lng }); // TODO: use better naming: formItem ?

    const _createStart = (latLng) => {
        setItem(newItem(latLng));
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

    const _updateName = (name) => {
        setItem(Object.assign({}, item, { name: name }));
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
        const [heading, centerLatLng, deviceLatLng] = (distanceHeading)
            ? [distanceHeading.heading, moveLatLngTo(item, distanceHeading.distance / 2, distanceUnit, distanceHeading.heading), latLng]
            : [0, item, null];
        return (
            <Map
                heading={heading}
                centerLatLng={centerLatLng}
                itemName={name}
                itemLatLng={item}
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
                const [_onSubmit, _disabled, _caption, _updateIndex, _cancel, _submitValue] = (view === View.Item_Create)
                    // TODO: cancel for View.Item_Create should be similar to when delete is successful
                    ? [_createEnd, !latLng, 'Create Item', -1, readItems, 'Create Item']
                    : [_updateEnd, false, ('Update ' + name), index, () => _read(0), 'Update Item'];
                return (
                    <Form onSubmit={_onSubmit}>
                        <fieldset disabled={_disabled}>
                            <legend>{_caption}</legend>
                            <label>
                                <span>Name</span>
                                <NameInput
                                    value={item.name}
                                    values={items}
                                    onChange={_updateName}
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
                if (!latLng) {
                    return (
                        <span>Getting location...</span>
                    );
                }
                const _distance = (distanceHeading) ? distanceHeading.distance : '?';
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
                    ? getDistanceHeading(item, geolocation.latLng, distanceUnit)
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