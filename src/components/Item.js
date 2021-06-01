import { useState } from 'react';

import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, Fieldset, Label, SubmitInput, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Item = (props) => {
    const [moveAmount, setMoveAmount] = useLocalStorage('move-amount', 1);
    const [formName, setFormName] = useState(props.name);
    const [formLat, setFormLat] = useState(props.lat);
    const [formLng, setFormLng] = useState(props.lng);
    return render({ ...props, moveAmount, setMoveAmount, formName, setFormName, formLat, setFormLat, formLng, setFormLng });
};

export const newItem = () => ({
    name: '[New Item]',
    lat: '[current]',
    lng: '[current]',
});

const render = (props) => (
    <Geolocation
        view={props.view}
        highAccuracyGPS={props.highAccuracyGPS}
        render={geolocation => {
            const distanceHeading = (View.isRead(props.view) && geolocation.latLng !== null)
                ? getDistanceHeading({ lat: props.lat, lng: props.lng }, geolocation.latLng, props.distanceUnit)
                : null;
            return renderItem({ ...props, geolocation, distanceHeading });
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
    const headerName = (View.isCreate(props.view)) ? '[Add Item]' : props.name;
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
                        title="edit item"
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
        return (<p>[Map disabled]</p>);
    }
    const [itemLat, itemLng]
        = (View.isCreate(props.view)) ? (props.geolocation.latLng ? [props.geolocation.latLng.lat, props.geolocation.latLng.lng] : [null, null])
            : (View.isUpdate(props.view)) ? [props.formLat, props.formLng] : [props.lat, props.lng];
    const item = { name: props.name, lat: itemLat, lng: itemLng };
    const [device, distanceHeading] = (props.distanceHeading)
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
        return (<span>Cannot get location</span>);
    }
    switch (props.view) {
        case View.Item_Create:
        case View.Item_Update:
            const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateIndex, handleCancel, submitValue] = (View.isCreate(props.view))
                ? [handleCreateEnd(props.createEnd, props.formName, props.geolocation.latLng), !!props.geolocation.latLng, true, 'Create Item', -1, handleReadItemList(props.readItemList), 'Create Item']
                : [handleUpdateEnd(props.updateEnd, props.index, props.formName, props.formLat, props.formLng), true, false, ('Update ' + props.name), props.index, handleRead(props.read, props.index, 0), 'Update Item'];
            return (
                <Form onSubmit={handleSubmit}>
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
                                <ButtonInput onClick={handleUpdateLatLng(Heading.N, props.moveAmount, props.formLat, props.setFormLat, props.formLng, props.setFormLng, props.distanceUnit)} value="+(N)" disabled={updateLatLngDisabled} />
                                <ButtonInput onClick={handleUpdateLatLng(Heading.S, props.moveAmount, props.formLat, props.setFormLat, props.formLng, props.setFormLng, props.distanceUnit)} value="-(S)" disabled={updateLatLngDisabled} />
                                <TextInput value={props.formLat} disabled />
                            </Label>
                            <Label caption="Longitude">
                                <ButtonInput onClick={handleUpdateLatLng(Heading.W, props.moveAmount, props.formLat, props.setFormLat, props.formLng, props.setFormLng, props.distanceUnit)} value="-(W)" disabled={updateLatLngDisabled} />
                                <ButtonInput onClick={handleUpdateLatLng(Heading.E, props.moveAmount, props.formLat, props.setFormLat, props.formLng, props.setFormLng, props.distanceUnit)} value="+(E)" disabled={updateLatLngDisabled} />
                                <TextInput value={props.formLng} disabled />
                            </Label>
                            <Label caption={`Move Amount (${props.distanceUnit})`}>
                                <NumberInput value={props.moveAmount} onChange={props.setMoveAmount} min="0" max="1000" />
                            </Label>
                        </Fieldset>
                        <div>
                            <ButtonInput value="cancel" onClick={handleCancel} />
                            <SubmitInput value={submitValue} disabled={!hasLatLng} />
                        </div>
                    </Fieldset>
                </Form>
            );
        case View.Item_Delete:
            return (
                <Form onSubmit={handleDeleteEnd(props.deleteEnd, props.index)}>
                    <Fieldset caption={'Delete ' + props.name}>
                        <div>
                            <ButtonInput value="Cancel" onClick={handleRead(props.read, props.index, 0)} />
                            <SubmitInput value="Delete item" />
                        </div>
                    </Fieldset>
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

const handleUpdateEnd = (updateEnd, index, formName, formLat, formLng) => () => (
    updateEnd(index, formName, formLat, formLng)
);

const handleDeleteStart = (deleteStart, index) => () => (
    deleteStart(index)
);

const handleDeleteEnd = (deleteEnd, index) => () => (
    deleteEnd(index)
);

const handleUpdateLatLng = (heading, moveAmount, formLat, setFormLat, formLng, setFormLng, distanceUnit) => () => {
    const formLatLng = moveLatLngTo({ lat: formLat, lng: formLng }, moveAmount, distanceUnit, heading);
    setFormLat(formLatLng.lat);
    setFormLng(formLatLng.lng);
};