import { useState } from 'react';

import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Item = (props) => {
    const item = props.item || newItem();
    const [moveAmount, setMoveAmount] = useLocalStorage('moveAmount', 1);
    const [formName, setFormName] = useLocalStorage('itemInputName', item.name || newItem().name); // same name as NameList.js
    const [formLatLng, setFormLatLng] = useState(item);
    const state = { item, moveAmount, setMoveAmount, formName, setFormName, formLatLng, setFormLatLng };
    return render({ ...props, ...state });
};

const newItem = () => ({
    name: '[New Item]',
    lat: '[current]',
    lng: '[current]',
});

const render = (props) => (
    <Geolocation
        view={props.view}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        render={geolocation => {
            const distanceHeading = (View.isRead(props.view) && geolocation.latLng !== null) && props.item
                ? getDistanceHeading(props.item, geolocation.latLng, props.distanceUnit)
                : null;
            const state = { geolocation, distanceHeading };
            return renderItem({ ...props, ...state });
        }}
    />
);

const renderItem = (props) => (
    <div className="Item">
        <div className="Item-Header">
            {getHeader(props)}
        </div>
        <div role="img">
            {getMap(props)}
        </div>
        <div>
            {getAction(props)}
        </div>
    </div>
);

const getHeader = (props) => {
    const prevDisabled = props.index <= 0;
    const headerName = (View.isCreate(props.view)) ? '[Add Item]' : props.item.name;
    const nextDisabled = !props.items || props.index + 1 >= props.items.length
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button className="left arrow"
                    disabled={prevDisabled}
                    onClick={handleRead(props.read, props.index, -1)}
                    title="previous item"
                >
                    <span>◀</span>
                </button>
                <button onClick={props.readItemList} title="item list" className="name">
                    <span>{headerName}</span>
                </button>
                <button className="right arrow"
                    disabled={nextDisabled}
                    onClick={handleRead(props.read, props.index, +1)}
                    title="next item"
                >
                    <span>▶</span>
                </button>
            </div>
            {
                showEdit &&
                <div className="row">
                    <button
                        onClick={handleUpdateStart(props.updateStart, props.index)}
                        title="update item"
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        onClick={handleDeleteStart(props.deleteStart, props.index)}
                        title="delete item"
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        onClick={handleCreateStart(props.createStart)}
                        title="create item"
                    >
                        <span>Add...</span>
                    </button>
                </div>
            }
        </>
    );
};

const getMap = (props) => {
    if (!props.geolocation.valid) {
        return (
            <p>[Map disabled]</p>
        );
    }
    const itemLatLng
        = (View.isCreate(props.view)) ? props.geolocation.latLng
            : (View.isUpdate(props.view)) ? props.formLatLng
                : props.item;
    if (!itemLatLng) {
        return (
            <p>Waiting for GPS...</p>
        );
    }
    const item = { name: props.item.name, ...itemLatLng };
    const [device, distanceHeading] = (props.geolocation && props.distanceHeading)
        ? [props.geolocation.latLng, props.distanceHeading]
        : [];
    return (
        <Map
            item={item}
            device={device}
            distanceHeading={distanceHeading}
            distanceUnit={props.distanceUnit}
        />
    );
};

const getAction = (props) => {
    if (!props.geolocation.valid) {
        return (
            <span>Cannot get location</span>
        );
    }
    switch (props.view) {
        case View.Item_Create:
        case View.Item_Update:
            const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateIndex, handleCancel, submitValue] = (View.isCreate(props.view))
                ? [handleCreateEnd(props.createEnd, props.formName, props.geolocation.latLng), !!props.geolocation.latLng, true, 'Create Item', -1, handleReadItemList(props.readItemList), 'Create Item']
                : [handleUpdateEnd(props.updateEnd, props.index, props.formName, props.formLatLng), true, false, ('Update ' + props.item.name), props.index, handleRead(props.read, props.index, 0), 'Update Item'];
            return (
                <Form
                    onSubmit={handleSubmit}
                    submitValue={submitValue}
                    submitDisabled={!hasLatLng}
                    onCancel={handleCancel}
                >
                    <Fieldset caption={actionName}>
                        <Label caption="Name">
                            <NameInput
                                value={props.formName}
                                values={props.items}
                                onChange={props.setFormName}
                                updateIndex={updateIndex}
                            />
                        </Label>
                        <Fieldset disabled={!hasLatLng} border={false}>
                            <Label caption="Latitude">
                                {getMoveLatLngButton(Heading.S, '-(S)', updateLatLngDisabled, props)}
                                {getMoveLatLngButton(Heading.N, '+(N)', updateLatLngDisabled, props)}
                                <TextInput value={props.formLatLng.lat} disabled />
                            </Label>
                            <Label caption="Longitude">
                                {getMoveLatLngButton(Heading.W, '-(W)', updateLatLngDisabled, props)}
                                {getMoveLatLngButton(Heading.E, '+(E)', updateLatLngDisabled, props)}
                                <TextInput value={props.formLatLng.lng} disabled />
                            </Label>
                            <Label caption={`Move Amount (${props.distanceUnit})`}>
                                <NumberInput value={props.moveAmount} onChange={props.setMoveAmount} min="0" max="1000" />
                            </Label>
                        </Fieldset>
                    </Fieldset>
                </Form>
            );
        case View.Item_Delete:
            return (
                <Form
                    onSubmit={handleDeleteEnd(props.deleteEnd, props.index)}
                    submitValue="Delete item"
                    onCancel={handleRead(props.read, props.index, 0)}
                >
                    <Fieldset caption={'Delete ' + props.item.name} />
                </Form>
            );
        case View.Item_Read:
        default:
            if (!props.geolocation.latLng) {
                return (
                    <span>Getting location...</span>
                );
            }
            return (
                <div className="distance">
                    <span>{String(props.distanceHeading.distance)}</span>
                    <span> {props.distanceUnit}</span>
                </div>
            );
    }
};

const getMoveLatLngButton = (heading, value, disabled, { moveAmount, formLatLng, setFormLatLng, distanceUnit }) => (
    <ButtonInput
        onClick={handleUpdateLatLng(heading, moveAmount, formLatLng, setFormLatLng, distanceUnit)}
        value={value}
        disabled={disabled}
    />
);

const handleCreateStart = (createStart) => () => (
    createStart()
);

const handleCreateEnd = (createEnd, formName, latLng) => () => (
    createEnd(formName, latLng.lat, latLng.lng)
);

const handleRead = (read, index, delta) => () => (
    read(index + delta)
);

const handleReadItemList = (readItemList) => () => (
    readItemList()
);

const handleUpdateStart = (updateStart, index) => () => (
    updateStart(index)
);

const handleUpdateEnd = (updateEnd, index, formName, formLatLng) => () => (
    updateEnd(index, formName, formLatLng.lat, formLatLng.lng)
);

const handleDeleteStart = (deleteStart, index) => () => (
    deleteStart(index)
);

const handleDeleteEnd = (deleteEnd, index) => () => (
    deleteEnd(index)
);

const handleUpdateLatLng = (heading, moveAmount, formLatLng, setFormLatLng, distanceUnit) => () => {
    setFormLatLng(moveLatLngTo(formLatLng, moveAmount, distanceUnit, heading));
};