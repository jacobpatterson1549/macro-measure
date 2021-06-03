import './Item.css';

import { Map } from './Map';
import { Geolocation } from './Geolocation';
import { Form, Fieldset, Label, NameInput, TextInput, NumberInput, ButtonInput } from './Form';
import { NameList } from './NameList';

import { useLocalStorage } from '../utils/LocalStorage';
import { getDistanceHeading, moveLatLngTo, Heading, roundLatLng as latLngOnly } from '../utils/Geolocation';
import { View } from '../utils/View';

export const Item = (props) => {
    const [moveAmount, setMoveAmount] = useLocalStorage('moveAmount', 1);
    const [name, setName] = useLocalStorage('itemInputName', '?'); // same name as NameList.js
    const [latLng, setLatLng] = useLocalStorage('itemInputLatLng', { lat: 0, lng: 0 });
    const state = { moveAmount, setMoveAmount, name, setName, latLng, setLatLng };
    return render({ ...props, ...state });
};

const render = (props) => (
    (props.view === View.Item_Read_List)
        ? renderItemList(props)
        : renderItem(props)
);

const renderItemList = (props) => (
    <NameList
        type="item"
        values={props.items}
        index={props.index}
        view={props.view}
        createStart={handleCreateStart(props)}
        read={props.read}
        updateStart={handleUpdateStartFromList(props)}
        deleteStart={handleDeleteStartFromList(props)}
        moveUp={props.moveUp}
        moveDown={props.moveDown}
    />
);

const renderItem = (props) => (
    <Geolocation
        view={props.view}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        render={geolocation => {
            const distanceHeading = (View.isRead(props.view) && geolocation.latLng !== null)
                ? getDistanceHeading(props.latLng, geolocation.latLng, props.distanceUnit)
                : null;
            const state = { geolocation, distanceHeading };
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
    const prevDisabled = props.index <= 0;
    const headerName
        = (View.isCreate(props.view)) ? '[Add Item]'
            : (props.items && props.items.length !== 0) ? props.items[props.index].name
                : '?';
    const nextDisabled = !props.items || props.index + 1 >= props.items.length
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button className="left arrow"
                    disabled={prevDisabled}
                    onClick={handleRead(-1, props)}
                    title="previous item"
                >
                    <span>◀</span>
                </button>
                <button onClick={handleReadItemList(props)} title="item list" className="name">
                    <span>{headerName}</span>
                </button>
                <button className="right arrow"
                    disabled={nextDisabled}
                    onClick={handleRead(+1, props)}
                    title="next item"
                >
                    <span>▶</span>
                </button>
            </div>
            {
                showEdit &&
                <div className="row">
                    <button
                        onClick={handleUpdateStart(props)}
                        title="update item"
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        onClick={handleDeleteStart(props)}
                        title="delete item"
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        onClick={handleCreateStart(props)}
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
    const [itemName, itemLatLng] = (View.isCreate(props.view))
        ? ['Item', props.geolocation.latLng]
        : [props.items[props.index].name, props.latLng];
    if (!itemLatLng) {
        return (
            <p>Waiting for GPS...</p>
        );
    }
    const item = { name: itemName, ...itemLatLng };
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
                ? [handleCreateEnd(props), !!props.geolocation.latLng, true, 'Create Item', -1, handleReadItemList(props), 'Create Item']
                : [handleUpdateEnd(props), true, false, ('Update ' + props.items[props.index].name), props.index, handleRead(0, props), 'Update Item'];
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
                                value={props.name}
                                values={props.items}
                                onChange={props.setName}
                                updateIndex={updateIndex}
                            />
                        </Label>
                        <Fieldset disabled={!hasLatLng} border={false}>
                            <Label caption="Latitude">
                                {getMoveLatLngButton(Heading.S, '-(S)', updateLatLngDisabled, props)}
                                {getMoveLatLngButton(Heading.N, '+(N)', updateLatLngDisabled, props)}
                                <TextInput value={props.latLng.lat} disabled />
                            </Label>
                            <Label caption="Longitude">
                                {getMoveLatLngButton(Heading.W, '-(W)', updateLatLngDisabled, props)}
                                {getMoveLatLngButton(Heading.E, '+(E)', updateLatLngDisabled, props)}
                                <TextInput value={props.latLng.lng} disabled />
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
                    onSubmit={handleDeleteEnd(props)}
                    submitValue="Delete item"
                    onCancel={handleRead(0, props)}
                >
                    <Fieldset caption={'Delete ' + props.items[props.index].name} />
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
                    <span className="unit"> {props.distanceUnit}</span>
                </div>
            );
    }
};

const getMoveLatLngButton = (heading, value, disabled, { moveAmount, latLng, setLatLng, distanceUnit }) => (
    <ButtonInput
        onClick={handleUpdateLatLng(heading, moveAmount, latLng, setLatLng, distanceUnit)}
        value={value}
        disabled={disabled}
    />
);

const handleCreateStart = ({ createStart, setName, setLatLng }) => () => {
    setName('[New Item Name]');
    setLatLng({ lat: '[current]', lng: 'current' });
    createStart();
};

const handleCreateEnd = ({ createEnd, name, geolocation, setLatLng }) => () => {
    setLatLng(geolocation.latLng);
    createEnd(name, geolocation.latLng.lat, geolocation.latLng.lng); // create with current position
};

const handleRead = (delta, { read, index }) => () => {
    read(index + delta);
};

const handleReadItemList = ({ readItemList }) => () => {
    readItemList();
};

const handleUpdateStart = ({ updateStart, items, index, setName, setLatLng }) => () => {
    const item = items[index]
    setName(item.name);
    setLatLng(latLngOnly(item));
    updateStart(index);
};

const handleUpdateStartFromList = ({ updateStart, items, setName, setLatLng }) => (index) => {
    handleUpdateStart({ updateStart, items, index, setName, setLatLng })();
};

const handleUpdateEnd = ({ updateEnd, index, name, latLng }) => () => {
    updateEnd(index, name, latLng.lat, latLng.lng);
};

const handleDeleteStart = ({ deleteStart, index }) => () => {
    deleteStart(index);
};

const handleDeleteStartFromList = ({ deleteStart }) => (index) => {
    handleDeleteStart({ deleteStart, index })();
};

const handleDeleteEnd = ({ deleteEnd, index }) => () => {
    deleteEnd(index);
};

const handleUpdateLatLng = (heading, moveAmount, latLng, setLatLng, distanceUnit) => () => {
    setLatLng(moveLatLngTo(latLng, moveAmount, distanceUnit, heading));
};