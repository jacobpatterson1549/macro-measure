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
    const state = {
        moveAmount, setMoveAmount,
        name, setName,
        latLng, setLatLng,
    };
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
        read={handleReadFromList(props)}
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
    const prevDisabled = props.index <= 0;
    const headerName
        = (View.isCreate(props.view)) ? '[Add Item]'
            : (props.items?.length) ? props.items[props.index].name
                : '?';
    const nextDisabled = !props.items || props.index + 1 >= props.items.length
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button
                    className="left arrow"
                    title="previous item"
                    disabled={prevDisabled}
                    onClick={handleRead(-1, props)}
                >
                    <span>◀</span>
                </button>
                <button
                    className="name"
                    title="item list"
                    onClick={handleReadItemList(props)}
                >
                    <span>{headerName}</span>
                </button>
                <button
                    className="right arrow"
                    title="next item"
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
                        title="update item"
                        onClick={handleUpdateStart(props)}
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        title="delete item"
                        onClick={handleDeleteStart(props)}
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        title="create item"
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
    const [itemName, itemLatLng] = (View.isCreate(props.view))
        ? ['Item', props.geolocation.latLng]
        : (props.items) ? [props.items[props.index].name, props.latLng]
            : [null];
    const item = { name: itemName, ...itemLatLng };
    const [device, distanceHeading] = (props.geolocation.valid && props.distanceHeading)
        ? [props.geolocation.latLng, props.distanceHeading]
        : [];
    return (!props.geolocation.valid) ? (<p>[Map disabled]</p>)
        : (!itemLatLng) ? (<p>Waiting for GPS...</p>)
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
    (!props.geolocation.valid) ? (<span>Cannot get location</span>)
        : View.isCreate(props.view) || View.isUpdate(props.view) ? getCreateOrUpdateAction(props)
            : View.isDelete(props.view) ? getDeleteAction(props)
                : getReadAction(props)
);

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, hasLatLng, updateLatLngDisabled, actionName, updateIndex, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), !!props.geolocation.latLng, true, 'Create Item', -1, handleReadItemList(props), 'Create Item']
        : [handleUpdateEnd(props), true, false, ('Update ' + props.items[props.index].name), props.index, handleRead(0, props), 'Update Item'];
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
                        updateIndex={updateIndex}
                        onChange={props.setName}
                    />
                </Label>
                <Fieldset disabled={!hasLatLng} border={false}>
                    <Label caption="Latitude">
                        {getMoveLatLngButton(Heading.S, '-(S)', updateLatLngDisabled, props)}
                        {getMoveLatLngButton(Heading.N, '+(N)', updateLatLngDisabled, props)}
                        <TextInput
                            value={props.latLng.lat}
                            disabled
                        />
                    </Label>
                    <Label caption="Longitude">
                        {getMoveLatLngButton(Heading.W, '-(W)', updateLatLngDisabled, props)}
                        {getMoveLatLngButton(Heading.E, '+(E)', updateLatLngDisabled, props)}
                        <TextInput
                            value={props.latLng.lng}
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
        submitValue="Delete item"
        onCancel={handleRead(0, props)}
        onSubmit={handleDeleteEnd(props)}
    >
        <Fieldset caption={'Delete ' + props.items[props.index].name} />
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

const getMoveLatLngButton = (heading, value, disabled, { moveAmount, latLng, setLatLng, distanceUnit }) => (
    <ButtonInput
        value={value}
        disabled={disabled}
        onClick={handleUpdateLatLng(heading, moveAmount, latLng, setLatLng, distanceUnit)}
    />
);

const handleCreateStart = ({ createStart, setName, setLatLng }) => () => {
    setName('[New Item Name]');
    setLatLng({ lat: '[current]', lng: '[current]' });
    createStart();
};

const handleCreateEnd = ({ createEnd, name, geolocation, setLatLng }) => () => {
    setLatLng(geolocation.latLng);
    createEnd(name, geolocation.latLng.lat, geolocation.latLng.lng); // create with current position
};

const handleRead = (delta, { read, items, index, setName, setLatLng }) => () => {
    const index2 = index + delta;
    const item = items[index2];
    setName(item.name);
    setLatLng(latLngOnly(item));
    read(index2);
};

const handleReadFromList = ({ read, items, setName, setLatLng }) => (index) => {
    handleRead(0, { read, items, index, setName, setLatLng })();
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