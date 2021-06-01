import { NameTable } from './NameTable';
import { Form, SubmitInput, NameInput, ButtonInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

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
        {getAction(props)}
    </div>
);

const getAction = ({ view, type, values, index, createStart, createEnd, updateEnd, deleteEnd, cancel, name, setName }) => {
    const value = (values && values.length !== 0) ? values[index] : {};
    if (View.isCreate(view) || View.isUpdate(view)) {
        const [handleSubmit, actionName, submitValue, updateIndex] = View.isCreate(view)
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
    }
    if (View.isDelete(view)) {
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
    }
    // (View.isRead(view))
    return (
        <Form onSubmit={handleCreateStart(createStart, setName)}>
            <SubmitInput value={'Create ' + type} />
        </Form>
    );
};

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