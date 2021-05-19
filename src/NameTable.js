import React from 'react';

export const NameTable = ({
    type, //: the display name of the type of value in the table
    values, //: array of objects, each of which should have a 'name' attribute.  The names should be unique.
    read,  // function that is call when a value's name is clicked
    update, // function to edit a value
    deleteValue, // function to delete a value
    moveUp, // function to decrease the index of the value
    moveDown, // function to increase the index of the value
}) => (
    <table>
        <caption>{type} Values</caption>
        <thead>
            <tr>
                <th scope="col" title="Name of Value">Name</th>
                <th scope="col" title="Move Value Up"></th>
                <th scope="col" title="Move Value Down"></th>
                <th scope="col" title="Rename Value">✎</th>
                <th scope="col" title="Delete Value">␡</th>
            </tr>
        </thead>
        <tbody>
            {
                values.length === 0
                    ? (<tr><td colSpan="5">No values exist.  Create one.</td></tr>)
                    : values.map((value, index) => (
                        <tr key={value.name}>
                            <td>
                                <button onClick={() => read(index)} title="select value">
                                    <span>{value.name}</span>
                                </button>
                            </td>
                            <td>{
                                index > 0 &&
                                <button onClick={() => moveUp(index)} title="move up">
                                    <span>▲</span>
                                </button>
                            }
                            </td>
                            <td>{
                                index + 1 < values.length &&
                                <button onClick={() => moveDown(index)} title="move down">
                                    <span>▼</span>
                                </button>
                            }
                            </td>
                            <td>
                                <button onClick={() => update(index)} title="edit value">
                                    <span>Edit</span>
                                </button>
                            </td>
                            <td>
                                <button onClick={() => deleteValue(index)} title="delete value">
                                    <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    ))
            }
        </tbody>
    </table>
);