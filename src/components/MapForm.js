import { MapCoordinatePixel } from './MapCoordinatePixel';
import { Form, Fieldset, Label, NameInput, FileInput } from './Form';

import { View } from '../utils/View';

export const MapForm = (props) => {
    return render(props);
};

const render = (props) => (
    (actions[props.view]
        || getReadAction
    )(props)
);

const getCreateOrUpdateAction = (props) => {
    const [handleSubmit, actionName, updateID, handleCancel, submitValue] = (View.isCreate(props.view))
        ? [handleCreateEnd(props), `Create ${props.type}`, null, handleReadList(props), `Create ${props.type}`]
        : [handleUpdateEnd(props), `Update ${props.item?.name}`, props.item?.id, handleRead(props), `Update ${props.type}`];
    return (
        <Form
            submitValue={submitValue}
            submitDisabled={!props.fileInput}
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
                <Label caption="File">
                    <FileInput
                        accept=""
                        onChange={props.setFileInput}
                    />
                </Label>
                {
                    props.file &&
                    <span>Dimensions: [{props.file.width} x {props.file.height}]</span>
                }
                <Fieldset
                    disabled={!props.file}
                    border={false}
                >
                    <MapCoordinatePixel
                        coordinateName="North Latitude"
                        coordinateValue={props.latNorthInput}
                        coordinateMin={-90}
                        coordinateMax={90}
                        setCoordinate={props.setLatNorthInput}
                        validateCoordinate={(value) => value > props.latSouthInput}
                        pixelName="pixels from top"
                        pixelValue={props.pixelTopInput}
                        pixelMin={0}
                        pixelMax={props.file?.height}
                        setPixel={props.setPixelTopInput}
                        validatePixel={(value) => value > props.pixelBottomInput}
                    />
                    <MapCoordinatePixel
                        coordinateName="East Longitude"
                        coordinateValue={props.lngEastInput}
                        coordinateMin={-180}
                        coordinateMax={180}
                        setCoordinate={props.setLngEastInput}
                        validateCoordinate={(value) => value > props.lngWestInput}
                        pixelName="pixels from right"
                        pixelValue={props.pixelRightInput}
                        pixelMin={0}
                        pixelMax={props.file?.width}
                        setPixel={props.setPixelRightInput}
                        validatePixel={(value) => value > props.pixelLeftInput}
                    />
                    <MapCoordinatePixel
                        coordinateName="South Latitude"
                        coordinateValue={props.latSouthInput}
                        coordinateMin={-90}
                        coordinateMax={90}
                        setCoordinate={props.setLatSouthInput}
                        validateCoordinate={(value) => value < props.latNorthInput}
                        pixelName="pixels from bottom"
                        pixelValue={props.pixelBottomInput}
                        pixelMin={0}
                        pixelMax={props.file?.height}
                        setPixel={props.setPixelBottomInput}
                        validatePixel={(value) => value < props.pixelTopInput}
                    />
                    <MapCoordinatePixel
                        coordinateName="West Longitude"
                        coordinateValue={props.lngWestInput}
                        coordinateMin={-180}
                        coordinateMax={180}
                        setCoordinate={props.setLngWestInput}
                        validateCoordinate={(value) => value < props.lngEastInput}
                        pixelName="pixels from left"
                        pixelValue={props.pixelLeftInput}
                        pixelMin={0}
                        pixelMax={props.file?.width}
                        setPixel={props.setPixelLeftInput}
                        validatePixel={(value) => value < props.pixelRightInput}
                    />
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

const getReadAction = (props) => (<></>); // show map only

const handleCreateEnd = (props) => async () => {
    const item = {
        name: props.nameInput,
        file: props.fileInput,
        latNorth: props.latNorthInput,
        lngEast: props.lngEastInput,
        latSouth: props.latSouthInput,
        lngWest: props.lngWestInput,
        pixelTop: props.pixelTopInput,
        pixelRight: props.pixelRightInput,
        pixelBottom: props.pixelBottomInput,
        pixelLeft: props.pixelLeftInput,
        moveAmount: props.moveAmountInput,
    }
    await props.createEnd(item);
    props.reloadItems();
};

const handleRead = ({ read, item }) => () => {
    read(item);
};

const handleReadList = ({ list }) => () => {
    list();
};

const handleUpdateEnd = (props) => async () => {
    const item = Object.assign({}, props.item, {
        name: props.nameInput,
        file: props.fileInput, // TODO: This line causes the image file to always be overridden.  Is this desired?
        latNorth: props.latNorthInput,
        lngEast: props.lngEastInput,
        latSouth: props.latSouthInput,
        lngWest: props.lngWestInput,
        pixelTop: props.pixelTopInput,
        pixelRight: props.pixelRightInput,
        pixelBottom: props.pixelBottomInput,
        pixelLeft: props.pixelLeftInput,
        moveAmount: props.moveAmountInput,
    });
    await props.updateEnd(item);
    props.reloadItems();
};

const handleDeleteEnd = ({ deleteEnd, item, reloadItems }) => async () => {
    await deleteEnd(item);
    reloadItems();
};

const actions = Object.fromEntries(
    View.AllIDs
        .filter((viewID) => View.isMap(viewID))
        .filter((viewID) => View.isCreate(viewID) || View.isUpdate(viewID) || View.isDelete(viewID))
        .map((viewID) => [viewID, View.isDelete(viewID) ? getDeleteAction : getCreateOrUpdateAction]));