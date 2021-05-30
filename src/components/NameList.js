import { NameTable } from './NameTable';
import { Form, SubmitInput, NameInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';

export const NameList = ({
    view, // the action being performed
    type, // the display name of the type of value in the table
    values, // array of objects, each of which should have a 'name' attribute.  The names should be unique.
    index, // the index of the value being edited
    createStart, // function to begin creating a value
    createEnd, // function to finish creating a value with the name
    read, // function to read the value when the name is clicked
    updateStart, // function to begin updating the name of the value at the index
    updateEnd, // function to finish updating the name of the value at the index
    deleteStart, // function to begin deleting the value at the index
    deleteEnd, // function to finish deleting the value at index
    moveUp, // function to decrease the index of the value
    moveDown, // function to increase the index of the value
    cancel, // function to cancel the current action
}) => {
    const [name, setName] = useLocalStorage(getLocalStorageNameKey(type), '?');
    return (
        <div>
            <NameTable
                type={type}
                values={values}
                read={read}
                update={handleUpdateStart(updateStart, setName, values)}
                deleteValue={handleDeleteStart(deleteStart, setName, values)}
                moveUp={moveUp}
                moveDown={moveDown}
            />
            {getActions(view, type, name, setName, values, index, createStart, createEnd, updateEnd, deleteEnd, cancel)}
        </div>
    );
};

const getActions = (view, type, name, setName, values, index, createStart, createEnd, updateEnd, deleteEnd, cancel) => {
    const value = (values.length !== 0) ? values[index] : {};
    switch (view) {
        case toCreateView(type):
        case toUpdateView(type):
            const [handleSubmit, actionName, submitValue, updateIndex] = (view === toCreateView(type))
                ? [handleCreateEnd(createEnd, name), ('Create ' + type), ('Create ' + type), -1]
                : [handleUpdateEnd(updateEnd, index, name), ('Update ' + value.name), ('Update ' + type), index];
            return (
                <Form onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>{actionName}</legend>
                        <label>
                            <span>Name:</span>
                            <NameInput
                                value={name}
                                values={values}
                                onChange={setName}
                                isUniqueName={updateIndex}
                            />
                        </label>
                        <div>
                            <ButtonInput value="Cancel" onClick={cancel} />
                            <SubmitInput value={submitValue} />
                        </div>
                    </fieldset>
                </Form>
            );
        case toDeleteView(type):
            return (
                <Form onSubmit={handleDeleteEnd(deleteEnd, index)}>
                    <fieldset>
                        <legend>Delete {value.name}?</legend>
                        <div>
                            <ButtonInput value="Cancel" onClick={cancel} />
                            <SubmitInput value={'Delete ' + type} />
                        </div>
                    </fieldset>
                </Form>
            );
        case toReadView(type):
        default:
            return (
                <Form onSubmit={handleCreateStart(createStart, setName)}>
                    <SubmitInput value={'Create ' + type} />
                </Form>
            );
    }
};

const toCreateView = (type) => type + '-create';
const toReadView = (type) => type + '-read';
const toUpdateView = (type) => type + '-update';
const toDeleteView = (type) => type + '-delete';
const getLocalStorageNameKey = (type) => type + '-name';

const handleCreateStart = (createStart, setName) => () => {
    setName('[New Value Name]');
    createStart();
};
const handleCreateEnd = (createEnd, name) => () => {
    createEnd(name);
};
const handleUpdateStart = (updateStart, setName, values) => (index) => {
    setName(values[index].name);
    updateStart(index);
};
const handleUpdateEnd = (updateEnd, index, name) => () => {
    updateEnd(index, name);
};
const handleDeleteStart = (deleteStart, setName, values) => (index) => {
    setName(values[index].name);
    deleteStart(index);
};
const handleDeleteEnd = (deleteEnd, index) => () => {
    deleteEnd(index);
};