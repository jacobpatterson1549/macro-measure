import React from 'react';

// props:
// type: the display name of the type of value in the table
// values[]: array of objects, each of which should have a 'name' attribute.  The names should be unique.
// read(value): function that is call when a value's name is clicked
// update(value): function to edit a value
// delete(value): function to delete a value
// moveUp(value): function to decrease the index of the value
// moveDown(value): function to increase the index of the value

export const NameTable = (props) => (
    <table>
        <caption>{props.type} Values</caption>
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
                props.values.length === 0
                    ? (<tr><td colSpan="5">No values exist.  Create one.</td></tr>)
                    : props.values.map((value, index, values) => (
                        <tr key={value.name}>
                            <td>
                                <button onClick={() => props.read(index)} title="select value">
                                    <span>{value.name}</span>
                                </button>
                            </td>
                            <td>{
                                index > 0 &&
                                <button onClick={() => props.moveUp(index)} title="move up">
                                    <span>▲</span>
                                </button>
                            }
                            </td>
                            <td>{
                                index + 1 < values.length &&
                                <button onClick={() => props.moveDown(index)} title="move down">
                                    <span>▼</span>
                                </button>
                            }
                            </td>
                            <td>
                                <button onClick={() => props.update(index)} title="edit value">
                                    <span>Edit</span>
                                </button>
                            </td>
                            <td>
                                <button onClick={() => props.delete(index)} title="delete value">
                                    <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    ))
            }
        </tbody>
    </table>
);