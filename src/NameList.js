import { Form, SubmitInput, NameInput, ButtonInput } from './Form';
import { NameTable } from './NameTable';
import { useLocalStorage } from './LocalStorage';

const toCreateView = (type) => type + '-create';
const toReadView = (type) => type + '-read';
const toUpdateView = (type) => type + '-update';
const toDeleteView = (type) => type + '-delete';
const getLocalStorageNameKey = (type) => type + '-name';

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

    const _createStart = () => {
        setName('[New Value Name]');
        createStart();
    };
    const _createEnd = () => {
        createEnd(name);
    };
    const _updateStart = (_index) => {
        setName(values[_index].name);
        updateStart(_index);
    };
    const _updateEnd = () => {
        updateEnd(index, name);
    };
    const _deleteStart = (_index) => {
        setName(values[_index].name);
        deleteStart(_index);
    };
    const _deleteEnd = () => {
        deleteEnd(index);
    };

    const getView = () => {
        switch (view) {
            case toCreateView(type):
            case toUpdateView(type):
                const [_onSubmit, _caption, _submitValue, _updateIndex] = (view === toCreateView(type))
                    ? [_createEnd, ('Create ' + type), ('Create ' + type), -1]
                    : [_updateEnd, ('Update ' + values[index].name), ('Update ' + type), index];
                return (
                    <Form onSubmit={_onSubmit}>
                        <fieldset>
                            <legend>{_caption}</legend>
                            <label>
                                <span>Name:</span>
                                <NameInput
                                    value={name}
                                    values={values}
                                    onChange={setName}
                                    isUniqueName={_updateIndex}
                                />
                            </label>
                            <div>
                                <ButtonInput value="Cancel" onClick={cancel} />
                                <SubmitInput value={_submitValue} />
                            </div>
                        </fieldset>
                    </Form>
                );
            case toDeleteView(type):
                const deleteName = values[index].name;
                return (
                    <Form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {deleteName}?</legend>
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
                    <Form onSubmit={_createStart}>
                        <SubmitInput value={'Create ' + type} />
                    </Form>
                );
        }
    };

    return (
        <div>
            <NameTable
                type={type}
                values={values}
                read={read}
                update={_updateStart}
                deleteValue={_deleteStart}
                moveUp={moveUp}
                moveDown={moveDown}
            />
            {getView()}
        </div>
    );
};
