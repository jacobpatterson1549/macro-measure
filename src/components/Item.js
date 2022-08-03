import { useState, useEffect } from 'react';

import './Item.css';

import { Compass } from './Compass';
import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useItems } from '../hooks/Database';
import { useGeolocation } from '../hooks/Geolocation';
import { useLocalStorage } from '../hooks/LocalStorage';

import { moveLatLngTo, Heading } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Item = (props) => {
    const geolocation = useGeolocation(props.view, props.highAccuracyGPS, props.setGPSOn);
    const [items, reloadItems] = useItems(props.db, props.objectStoreName, props.parentItemID);
    const [item, setItem] = useState(null);
    const [device, setDevice] = useState(null);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);
    const [headerName, setHeaderName] = useState('?');
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?'); // same name as NameList.js
    const [latInput, setLatInput] = useLocalStorage(`${props.type}InputLat`, 0);
    const [lngInput, setLngInput] = useLocalStorage(`${props.type}InputLng`, 0);
    const [moveAmountInput, setMoveAmountInput] = useLocalStorage('moveAmountInput', 1);
    useEffect(() => {
        if (props.itemID) {
            const itemsWithID = items?.filter((dbItem) => dbItem.id === props.itemID);
            const item2 = itemsWithID?.[0];
            if (item2) {
                setItem(item2);
                setNameInput(item2.name);
                setLatInput(item2.lat);
                setLngInput(item2.lng);
            }
        }
    }, [setItem, setNameInput, setLatInput, setLngInput, items, props.itemID]);
    useEffect(() => {
        setPrevDisabled(!item || item.order <= 0);
        setNextDisabled(!item || !items || item.order + 1 >= items.length);
    }, [setPrevDisabled, setNextDisabled, item, items]);
    useEffect(() => {
        const getItemName = () => (
            (item)
                ? item.name
                : '?'
        );
        const headerName2 = (View.isCreate(props.view))
            ? `[Add ${props.type}]`
            : getItemName();
        setHeaderName(headerName2);
    }, [setHeaderName, item, props.view, props.type]);
    useEffect(() => {
        const device2 = (geolocation.valid && geolocation.lat && geolocation.lng)
            ? { lat: geolocation.lat, lng: geolocation.lng, speed: geolocation.speed, heading: geolocation.heading }
            : null;
        setDevice(device2);
    }, [setDevice, geolocation.valid, geolocation.lat, geolocation.lng, geolocation.speed, geolocation.heading]);
    const state = {
        prevDisabled, headerName, nextDisabled,
        geolocation,
        moveAmountInput, setMoveAmountInput,
        nameInput, setNameInput,
        latInput, setLatInput,
        lngInput, setLngInput,
        item, setItem,
        device,
        items, reloadItems,
    }
    return render({ ...props, ...state });
};

const render = (props) => (
    <div className="Item">
        <div className="Item-Header">
            {getHeader(props)}
        </div>
        <Compass
            item={props.item}
            device={props.device}
            accuracy={props.geolocation.accuracy}
            distanceUnit={props.distanceUnit}
        />
        <div className="Actions">
            {getAction(props)}
        </div>
    </div>
);

const getHeader = (props) => {
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button
                    className="left arrow"
                    title={`previous ${props.type}`}
                    disabled={props.prevDisabled}
                    onClick={handleRead(-1, props)}
                >
                    <span>◀</span>
                </button>
                <button
                    className="name"
                    title={`${props.type} list`}
                    onClick={handleReadList(props)}
                >
                    <span>{props.headerName}</span>
                </button>
                <button
                    className="right arrow"
                    title={`next ${props.type}`}
                    disabled={props.nextDisabled}
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

const getAction = (props) => (
    (!props.geolocation.valid)
        ? (<span>Cannot get location</span>)
        : (actions[props.view] || getReadAction)(props)
);

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateID, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), props.geolocation.lat && props.geolocation.lng, true, `Create ${props.type}`, null, handleReadList(props), `Create ${props.type}`]
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
        onCancel={handleRead(0, props)}
        onSubmit={handleDeleteEnd(props)}
    >
        <Fieldset caption={`Delete ${props.item?.name}`} />
    </Form>
);

const getReadAction = (props) => (
    <></> // no additional components for read action
);

const getMoveLatLngButton = (heading, value, disabled, { moveAmount: moveAmountInput, latInput, lngInput, setLatInput, setLngInput, distanceUnit }) => (
    <ButtonInput
        value={value}
        disabled={disabled}
        onClick={handleUpdateLatLng(heading, moveAmountInput, latInput, setLatInput, lngInput, setLngInput, distanceUnit)}
    />
);

const handleCreateStart = ({ type, createStart, setNameInput, setLatInput, setLngInput }) => () => {
    setNameInput(`[New ${type} Name]`);
    setLatInput('[current]');
    setLngInput('[current]');
    createStart();
};

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

const handleRead = (delta, { read, items, item }) => () => {
    items.forEach((item3) => {
        if (item3.order === item.order + delta) {
            read(item3);
        }
    })
};

const handleReadList = ({ list }) => () => {
    list();
};

const handleUpdateStart = ({ updateStart, item }) => () => {
    updateStart(item);
};

const handleUpdateEnd = ({ updateEnd, item, nameInput, latInput, lngInput, setItem, reloadItems, }) => async () => {
    const item2 = Object.assign({}, item, {
        name: nameInput,
        lat: latInput,
        lng: lngInput,
    });
    setItem(item2);
    await updateEnd(item2);
    reloadItems();
};

const handleDeleteStart = ({ deleteStart, item }) => () => {
    deleteStart(item);
};

const handleDeleteEnd = ({ deleteEnd, item, reloadItems, }) => async () => {
    await deleteEnd(item);
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