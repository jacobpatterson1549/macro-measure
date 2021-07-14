import { NameTable } from './NameTable';
import { Form, Fieldset, Label, NameInput } from './Form';

import { useItems } from '../hooks/Database';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const NameList = (props) => {
    const [name, setName] = useLocalStorage(`${props.type}NameListTitle`, '?');
    const [nameInput, setNameInput] = useLocalStorage(`${props.type}InputName`, '?'); // same name as Item.js
    const [items, reloadItems] = useItems(props.objectStoreName, props.parentItemID);
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
            items={props.items} // TODO: use items everywhere instead of values
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

const getCreateOrUpdateAction = ({ view, type, items, itemID, createEnd, updateEnd, list, name, nameInput, setNameInput }) => {
    const [handleSubmit, actionName, submitValue, updateID] = View.isCreate(view)
        ? [handleCreateEnd(createEnd, nameInput), `Create ${type}`, `Create ${type}`, null]
        : [handleUpdateEnd(updateEnd, nameInput, itemID), `Update ${name}`, `Update ${type}`, itemID];
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

const getDeleteAction = ({ deleteEnd, name, itemID, type, list }) => (
    <Form
        submitValue={'Delete ' + type}
        onCancel={list}
        onSubmit={handleDeleteEnd(deleteEnd, itemID)}
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
const handleCreateEnd = (createEnd, name) => () => {
    const item = { name: name };
    createEnd(item);
};
const handleUpdateStart = (updateStart, setName, setNameInput) => (item) => {
    setName(item.name);
    setNameInput(item.name); // TODO: are these setters needed?  React should take care of this when the view is changed.
    updateStart(item);
};
const handleUpdateEnd = (updateEnd, name, itemID) => () => {
    const item2 = { name: name, id: itemID };
    updateEnd(item2);
};
const handleDeleteStart = (deleteStart, setName) => (item) => {
    setName(item.name);
    deleteStart(item);
};
const handleDeleteEnd = (deleteEnd, itemID) => () => {
    deleteEnd(itemID);
};

const actions = Object.fromEntries(
    View.AllIDs
        .filter((viewId) => View.isCreate(viewId) || View.isUpdate(viewId) || View.isDelete(viewId))
        .map((viewId) => [viewId, View.isDelete(viewId) ? getDeleteAction : getCreateOrUpdateAction]));