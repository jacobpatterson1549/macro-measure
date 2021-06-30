import { useState, useEffect } from 'react';

import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useItems } from '../hooks/Database';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading, roundLatLng as latLngOnly } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Item = (props) => {
    const [moveAmount, setMoveAmount] = useLocalStorage('moveAmount', 1);
    const [name, setName] = useLocalStorage('itemInputName', '?'); // same name as NameList.js
    const [lat, setLat] = useLocalStorage('itemInputLat', 0);
    const [lng, setLng] = useLocalStorage('itemInputLng', 0);
    const [items] = useItems(props.objectStoreName, props.parentItemID);
    const [item, setItem] = useState(null);
    useEffect(() => {
        if (item?.id !== props.itemID) {
        items?.filter((dbItem => dbItem.id === props.itemID))
            .forEach((dbItem) => {
                setItem(dbItem)
                setName(dbItem.name);
                const latLng = latLngOnly(dbItem);
                setLat(latLng.lat || 0);
                setLng(latLng.lng || 0);
            });
        }
    }, [items, setItem, props.itemID, setName, setLat, setLng, name, lat, lng, props.view, item]);
    const state = {
        moveAmount, setMoveAmount,
        name, setName,
        lat, setLat,
        lng, setLng,
        items, item, usePropsItems: true,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <Geolocation
        view={props.view}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        render={geolocation => {
            const distanceHeading = (View.isRead(props.view) && geolocation.latLng !== null)
                ? getDistanceHeading({ lat: props.lat, lng: props.lng }, geolocation.latLng, props.distanceUnit)
                : null;
            const state = {
                geolocation,
                distanceHeading,
            };
            return renderItemHelper({ ...props, ...state });
        }}
    />
);

const renderItemHelper = (props) => (
    <div className="Item">
        <div className="Item-Header">
            {getHeader(props)}
        </div>
        <div role="img">
            {getMap(props)}
        </div>
        <div className="Actions">
            {getAction(props)}
        </div>
    </div>
);

const getHeader = (props) => {
    const prevDisabled = !props.item || props.item.order <= 0;
    const headerName
        = (View.isCreate(props.view)) ? `[Add ${props.type}]`
            : (props.item) ? props.item.name
                : '?';
    const nextDisabled = !props.item || props.item.order + 1 >= props.items.length
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button
                    className="left arrow"
                    title={`previous ${props.type}`}
                    disabled={prevDisabled}
                    onClick={handleRead(-1, props)}
                >
                    <span>◀</span>
                </button>
                <button
                    className="name"
                    title={`${props.type} list`}
                    onClick={handleReadItemList(props)}
                >
                    <span>{headerName}</span>
                </button>
                <button
                    className="right arrow"
                    title={`next ${props.type}`}
                    disabled={nextDisabled}
                    onClick={handleRead(+1, props)}
                >
                    <span>▶</span>
                </button>
            </div>
            {
                showEdit &&
                <div className="row">
                    <button
                        title={`update ${props.type}`}
                        onClick={handleUpdateStart(props)}
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        title={`delete ${props.type}`}
                        onClick={handleDeleteStart(props)}
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        title={`create ${props.type}`}
                        onClick={handleCreateStart(props)}
                    >
                        <span>Add...</span>
                    </button>
                </div>
            }
        </>
    );
};

const getMap = (props) => {
    const [itemName, itemLat, itemLng] = (View.isCreate(props.view) && props.geolocation.latLng)
        ? ['Waypoint', props.geolocation.latLng.lat, props.geolocation.latLng.lng]
        : (props.item) ? [props.item.name, props.lat, props.lng]
            : [null];
    const item = {
        name: itemName,
        lat: itemLat,
        lng: itemLng,
    };
    const [device, distanceHeading] = (props.geolocation.valid && props.distanceHeading)
        ? [props.geolocation.latLng, props.distanceHeading]
        : [];
    return (!props.geolocation.valid) ? (<p>[Map disabled]</p>)
        : (!itemLat || !itemLng) ? (<p>Waiting for GPS...</p>)
            : (
                <Map
                    item={item}
                    device={device}
                    accuracy={props.geolocation.accuracy}
                    distanceHeading={distanceHeading}
                    distanceUnit={props.distanceUnit}
                />
            );
};

const getAction = (props) => (
    (!props.geolocation.valid)
        ? (<span>Cannot get location</span>)
        : (actions[props.view] || getReadAction)(props)
);

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateID, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), !!props.geolocation.latLng, true, `Create ${props.type}`, null, handleReadItemList(props), `Create ${props.type}`]
        : [handleUpdateEnd(props), true, false, `Update ${props.item?.name}`, props.item?.id, handleRead(0, props), `Update ${props.type}`];
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
                        value={props.name}
                        values={props.items}
                        updateID={updateID}
                        onChange={props.setName}
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
                            value={props.moveAmount}
                            min="0"
                            max="1000"
                            onChange={props.setMoveAmount}
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
        onCancel={handleRead(0, props)}
        onSubmit={handleDeleteEnd(props)}
    >
        <Fieldset caption={`Delete ${props.item?.name}`} />
    </Form>
);

const getReadAction = (props) => (
    (!props.geolocation.latLng)
        ? (
            <span>Getting location...</span>
        )
        : (
            <div className="distance">
                <span>{String(props.distanceHeading.distance)}</span>
                <span className="unit"> {props.distanceUnit}</span>
            </div>
        )
);

const getMoveLatLngButton = (heading, value, disabled, { moveAmount, lat, lng, setLat, setLng, distanceUnit }) => (
    <ButtonInput
        value={value}
        disabled={disabled}
        onClick={handleUpdateLatLng(heading, moveAmount, lat, setLat, lng, setLng, distanceUnit)}
    />
);

const handleCreateStart = ({ type, createStart, setName, setLat, setLng }) => () => {
    setName(`[New ${type} Name]`);
    setLat('[current]');
    setLng('[current]');
    createStart();
};

const handleCreateEnd = ({ createEnd, name, geolocation, parentItemID }) => () => {
    const item2 = {
        name: name,
        lat: geolocation.latLng.lat, // create with current position
        lng: geolocation.latLng.lng,
        parentItemID: parentItemID,
    }
    createEnd(item2);
};

const handleRead = (delta, { read, items, item }) => () => {
    let item2;
    items.forEach((item3) => {
        if (item3.order === item.order + delta) {
            item2 = item3;
        }
    })
    read(item2);
};

const handleReadItemList = ({ list }) => () => {
    list();
};

const handleUpdateStart = ({ updateStart, item }) => () => {
    updateStart(item);
};

const handleUpdateEnd = ({ updateEnd, item, name, lat, lng }) => () => {
    const item2 = Object.assign({}, item, {
        name: name,
        lat: lat,
        lng: lng,
    });
    updateEnd(item2);
};

const handleDeleteStart = ({ deleteStart, item }) => () => {
    deleteStart(item);
};

const handleDeleteEnd = ({ deleteEnd, item }) => () => {
    deleteEnd(item);
};

const handleUpdateLatLng = (heading, moveAmount, lat, setLat, lng, setLng, distanceUnit) => () => {
    const latLng = {
        lat: lat,
        lng: lng,
    };
    const latLng2 = moveLatLngTo(latLng, moveAmount, distanceUnit, heading);
    setLat(latLng2.lat);
    setLng(latLng2.lng);
};

const actions = Object.fromEntries(
    View.AllIDs
        .filter((viewId) => View.isCreate(viewId) || View.isUpdate(viewId) || View.isDelete(viewId))
        .map((viewId) => [viewId, View.isDelete(viewId) ? getDeleteAction : getCreateOrUpdateAction]));