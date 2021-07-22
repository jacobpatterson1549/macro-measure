import { useEffect } from 'react';

import './WaypointForm.css';

import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';

import { useLocalStorage } from '../hooks/LocalStorage';

import { View } from '../utils/View';
import { moveLatLngTo, Heading } from '../utils/Geolocation';

export const WaypointForm = (props) => {
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?'); // same name as NameList.js
    const [latInput, setLatInput] = useLocalStorage(`${props.type}InputLat`, 0);
    const [lngInput, setLngInput] = useLocalStorage(`${props.type}InputLng`, 0);
    const [moveAmountInput, setMoveAmountInput] = useLocalStorage('moveAmountInput', 1);
    useEffect(() => {
        if (props.item) {
            setNameInput(props.item.name);
            setLatInput(props.item.lat);
            setLngInput(props.item.lng);
        }
    }, [props.item, setNameInput, setLatInput, setLngInput]);

    const state = {
        nameInput, setNameInput,
        latInput, setLatInput,
        lngInput, setLngInput,
        moveAmountInput, setMoveAmountInput,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    (actions[props.view]
        || getReadAction
    )(props)
);

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateID, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), props.geolocation.lat && props.geolocation.lng, true, `Create ${props.type}`, null, handleReadList(props), `Create ${props.type}`]
        : [handleUpdateEnd(props), true, false, `Update ${props.item?.name}`, props.item?.id, handleRead(props), `Update ${props.type}`];
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
        onCancel={handleRead(props)}
        onSubmit={handleDeleteEnd(props)}
    >
        <Fieldset caption={`Delete ${props.item?.name}`} />
    </Form>
);

const getReadAction = (props) => (
    (props.distanceHeading)
        ? (
            <div className="distance">
                <span>{String(props.distanceHeading.distance)}</span>
                <span className="unit"> {props.distanceUnit}</span>
            </div>
        )
        : (
            <span>Getting location...</span>
        )
);

const getMoveLatLngButton = (heading, value, disabled, { moveAmount: moveAmountInput, latInput, lngInput, setLatInput, setLngInput, distanceUnit }) => (
    <ButtonInput
        value={value}
        disabled={disabled}
        onClick={handleUpdateLatLng(heading, moveAmountInput, latInput, setLatInput, lngInput, setLngInput, distanceUnit)}
    />
);

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

const handleRead = ({ read, item }) => () => {
    read(item);
};

const handleReadList = ({ list }) => () => {
    list();
};

const handleUpdateEnd = ({ updateEnd, item, nameInput, latInput, lngInput, reloadItems }) => async () => {
    const item2 = Object.assign({}, item, {
        name: nameInput,
        lat: latInput,
        lng: lngInput,
    });
    await updateEnd(item2);
    reloadItems();
};

const handleDeleteEnd = ({ deleteEnd, item, reloadItems }) => async () => {
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