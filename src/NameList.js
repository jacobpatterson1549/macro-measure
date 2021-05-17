import { useState } from 'react';

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

    const _createStart = (event) => {
        event.preventDefault();
        createStart();
        setName('[New Value Name]');
    };
    const _createEnd = (event) => {
        event.preventDefault();
        createEnd(name);
    };
    const _updateStart = (index) => {
        setName(values[index].name);
        updateStart(index);
    };
    const _updateEnd = (event) => {
        event.preventDefault();
        updateEnd(index, name);
    };
    const _deleteStart = (index) => {
        setName(values[index].name);
        deleteStart(index);
    };
    const _deleteEnd = (event) => {
        event.preventDefault();
        deleteEnd(index);
    };

    const updateName = (event) => {
        const nameInput = event.target;
        const name = nameInput.value;
        const isUniqueName = uniqueName(name);
        nameInput.setCustomValidity(isUniqueName ? '' : 'duplicate name');
        setName(name);
    };
    const uniqueName = (name) => {
        for (let i = 0; i < values.length; i++) {
            const value = values[i]
            if (name === value.name && (view !== (type + '-update') || i === index)) {
                return false;
            }
        }
        return true;
    };

    const cancelButton = () => {
        return (
            <button type="button" onClick={() => cancel()}>
                <span>Cancel</span>
            </button>
        );
    };
    const getView = () => {
        switch (view) {
            case (type + "-create"):
            case (type + "-update"):
                return (
                    <form onSubmit={(view === (type + '-create') ? _createEnd : _updateEnd)}>
                        <fieldset>
                            <legend>
                                {(view === (type + '-create') ? 'Create ' + type : 'Update ' + values[index].name)}
                            </legend>
                            <label>
                                <span>Name:</span>
                                <input type="text" value={name} required onChange={updateName} onFocus={(event) => event.target.select()} />
                            </label>
                            <div>
                                {cancelButton()}
                                <input type="submit" value={(view === (type + '-create') ? 'Create ' : 'Update ') + type} />
                            </div>
                        </fieldset>
                    </form>
                );
            case (type + '-delete'):
                return (
                    <form onSubmit={_deleteEnd}>
                        <fieldset>
                            <legend>Delete {values[index].name}?</legend>
                            <div>
                                {cancelButton()}
                                <input type="submit" value={"Delete " + type} />
                            </div>
                        </fieldset>
                    </form>
                );
            default:
            case (type + '-read'):
                return (
                    <form onSubmit={_createStart}>
                        <input type="submit" value={"Create " + type} />
                    </form>
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
                delete={_deleteStart}
                moveUp={moveUp}
                moveDown={moveDown}
            />
            {getView()}
        </div>
    );
};
