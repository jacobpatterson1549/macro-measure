import { NameTable } from './NameTable';
import { Form, Fieldset, Label, NameInput } from './Form';

import { useItems } from '../hooks/Database';
import { useLocalStorage } from '../hooks/LocalStorage';

import { View } from '../utils/View';

export const NameList = (props) => {
    const [name, setName] = useLocalStorage(`${props.type}NameListTitle`, '?');
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?'); // same name as Item.js
    const [items, reloadItems] = useItems(props.db, props.objectStoreName, props.parentItemID);
    const state = {
        name, setName,
        nameInput, setNameInput,
        items, reloadItems,
    };
    return render({ ...props, ...state });
};

const render = (props) => (
    <div>
        <NameTable
            type={props.type}
            items={props.items}
            reloadItems={props.reloadItems}
            read={props.read}
            update={handleUpdateStart(props.updateStart, props.setName, props.setNameInput)}
            deleteValue={handleDeleteStart(props.deleteStart, props.setName)}
            moveUp={props.moveUp}
            moveDown={props.moveDown}
        />
        {getAction(props)}
    </div>
);

const getAction = (props) => (
    (actions[props.view] || getReadAction)(props)
);

const getCreateOrUpdateAction = ({ view, type, items, itemID, createEnd, updateEnd, list, name, nameInput, setNameInput, reloadItems }) => {
    const [handleSubmit, actionName, submitValue, updateID] = View.isCreate(view)
        ? [handleCreateEnd(createEnd, nameInput, reloadItems), `Create ${type}`, `Create ${type}`, null]
        : [handleUpdateEnd(updateEnd, nameInput, itemID, reloadItems), `Update ${name}`, `Update ${type}`, itemID];
    return (
        <Form
            submitValue={submitValue}
            onCancel={list}
            onSubmit={handleSubmit}
        >
            <Fieldset caption={actionName}>
                <Label caption="Name">
                    <NameInput
                        value={nameInput}
                        values={items}
                        updateID={updateID}
                        onChange={setNameInput}
                    />
                </Label>
            </Fieldset>
        </Form>
    );
};

const getDeleteAction = ({ deleteEnd, name, itemID, type, list, reloadItems }) => (
    <Form
        submitValue={'Delete ' + type}
        onCancel={list}
        onSubmit={handleDeleteEnd(deleteEnd, itemID, reloadItems)}
    >
        <Fieldset caption={`Delete ${name}`} />
    </Form>
);

const getReadAction = ({ createStart, setName, setNameInput, type }) => (
    <Form
        submitValue={`Create ${type}`}
        onSubmit={handleCreateStart(createStart, setName, setNameInput)}
    />
);

const handleCreateStart = (createStart, setName, setNameInput) => () => {
    const name = '[New Value Name]';
    setName(name);
    setNameInput(name);
    createStart();
};
const handleCreateEnd = (createEnd, name, reloadItems) => async () => {
    const item = { name: name };
    await createEnd(item);
    reloadItems();
};
const handleUpdateStart = (updateStart, setName, setNameInput) => (item) => {
    setName(item.name);
    setNameInput(item.name);
    updateStart(item);
};
const handleUpdateEnd = (updateEnd, name, itemID, reloadItems) => async () => {
    const item2 = { name: name, id: itemID };
    await updateEnd(item2);
    reloadItems();
};
const handleDeleteStart = (deleteStart, setName) => (item) => {
    setName(item.name);
    deleteStart(item);
};
const handleDeleteEnd = (deleteEnd, itemID, reloadItems) => async () => {
    const item = { id: itemID };
    await deleteEnd(item);
    reloadItems();
};

const actions = Object.fromEntries(
    View.AllIDs
        .filter((viewID) => View.isCreate(viewID) || View.isUpdate(viewID) || View.isDelete(viewID))
        .map((viewID) => [viewID, View.isDelete(viewID) ? getDeleteAction : getCreateOrUpdateAction]));