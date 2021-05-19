import { useState } from 'react';

import { Form, SubmitInput, NameInput, ButtonInput } from './Form';
import { NameTable } from './NameTable';

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

    const [name, setName] = useState('?');

    const _createStart = () => {
        createStart();
        setName('[New Value Name]');
    };
    const _createEnd = () => {
        createEnd(name);
    };
    const _updateStart = (index) => {
        setName(values[index].name);
        updateStart(index);
    };
    const _updateEnd = () => {
        updateEnd(index, name);
    };
    const _deleteStart = (index) => {
        setName(values[index].name);
        deleteStart(index);
    };
    const _deleteEnd = () => {
        deleteEnd(index);
    };

    const getView = () => {
        switch (view) {
            case (type + "-create"):
            case (type + "-update"):
                return (
                    <Form onSubmit={(view === (type + '-create') ? _createEnd : _updateEnd)}>
                        <fieldset>
                            <legend>
                                {(view === (type + '-create') ? 'Create ' + type : 'Update ' + values[index].name)}
                            </legend>
                            <label>
                                <span>Name:</span>
                                <NameInput
                                    value={name}
                                    values={values}
                                    onChange={setName}
                                    isUniqueName={(view === (type + '-update')) ? index : -1}
                                />
                            </label>
                            <div>
                                <ButtonInput value="Cancel" onClick={cancel} />
                                <SubmitInput value={(view === (type + '-create') ? 'Create ' : 'Update ') + type} />
                            </div>
                        </fieldset>
                    </Form>
                );
            case (type + '-delete'):
                return (
                    <Form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {values[index].name}?</legend>
                            <div>
                                <ButtonInput value="Cancel" onClick={cancel} />
                                <SubmitInput value={"Delete " + type} />
                            </div>
                        </fieldset>
                    </Form>
                );
            default:
            case (type + '-read'):
                return (
                    <Form onSubmit={_createStart}>
                        <SubmitInput value={"Create " + type} />
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
