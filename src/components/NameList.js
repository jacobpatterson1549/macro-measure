import { NameTable } from './NameTable';
import { Form, SubmitInput, NameInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';

export const NameList = (props) => {
    const [name, setName] = useLocalStorage(getLocalStorageNameKey(props.type), '?');
    return render({ ...props, name, setName });
};

const render = (props) => (
    <div>
        <NameTable
            type={props.type}
            values={props.values}
            read={props.read}
            update={handleUpdateStart(props.updateStart, props.setName, props.values)}
            deleteValue={handleDeleteStart(props.deleteStart, props.setName, props.values)}
            moveUp={props.moveUp}
            moveDown={props.moveDown}
        />
        {getActions(props)}
    </div>
);

const getActions = ({ view, type, values, index, createStart, createEnd, updateEnd, deleteEnd, cancel, name, setName }) => {
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

const toCreateView = (type) => (
    type + '-create'
);

const toReadView = (type) => (
    type + '-read'
);

const toUpdateView = (type) => (
    type + '-update'
);

const toDeleteView = (type) => (
    type + '-delete'
);

const getLocalStorageNameKey = (type) => (
    type + '-name'
);

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