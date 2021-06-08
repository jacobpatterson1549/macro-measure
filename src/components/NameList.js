import { NameTable } from './NameTable';
import { Form, Fieldset, Label, NameInput } from './Form';

import { useLocalStorage } from '../utils/LocalStorage';
import { View } from '../utils/View';

export const NameList = (props) => {
    const [name, setName] = useLocalStorage(getLocalStorageNameKey(props.type), '?');
    const state = {
        name, setName,
    };
    return render({ ...props, ...state });
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

const getAction = (props) => (
    View.isCreate(props.view) || View.isUpdate(props.view) ? getCreateOrUpdateAction(props)
        : View.isDelete(props.view) ? getDeleteAction(props)
            : getReadAction(props)
);

const getCreateOrUpdateAction = ({ view, type, values, index, createEnd, updateEnd, cancel, name, setName }) => {
    const [handleSubmit, actionName, submitValue, updateIndex] = View.isCreate(view)
        ? [handleCreateEnd(createEnd, name), ('Create ' + type), ('Create ' + type), -1]
        : [handleUpdateEnd(updateEnd, index, name), ('Update ' + getValueName(values, index)), ('Update ' + type), index];
    return (
        <Form
            submitValue={submitValue}
            onCancel={cancel}
            onSubmit={handleSubmit}
        >
            <Fieldset caption={actionName}>
                <Label caption="Name">
                    <NameInput
                        value={name}
                        values={values}
                        isUniqueName={updateIndex}
                        onChange={setName}
                    />
                </Label>
            </Fieldset>
        </Form>
    );
};

const getDeleteAction = ({ deleteEnd, values, index, type, cancel }) => (
    <Form
        submitValue={'Delete ' + type}
        onCancel={cancel}
        onSubmit={handleDeleteEnd(deleteEnd, index)}
    >
        <Fieldset caption={'Delete ' + getValueName(values, index)} />
    </Form>
);

const getReadAction = ({ createStart, setName, type }) => (
    <Form
        submitValue={'Create ' + type}
        onSubmit={handleCreateStart(createStart, setName)}
    />
);

const getValueName = (values, index) => (
    (values?.length) ? values[index].name : '?'
);

const getLocalStorageNameKey = (type) => (
    type + 'InputName' // same name as Item.js
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