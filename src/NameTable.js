import React from 'react';

import MoveRowSpan from './MoveRowSpan';

export default function NameTable(props) {

    // props:
    // values[]: array of objects, each of which should have a 'name' attrtibute.  The names should be unique.
    // select(value): function that is call when a value's name is clicked
    // moveUp(value): function to decrease the index of the value
    // moveDown(value): function to increase the index of the value
    // edit(value): function to edit a value
    // delete(value): function to delete a value

    return (
        <table>
            <caption>Values</caption>
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
                        ? <tr><td colSpan="4">No values exist.  Create one.</td></tr>
                        : props.values.map((value, index, values) => (
                            <tr key={value.name}>
                                <td onClick={() => props.select(value)} title="select value">{value.name}</td>
                                <td><MoveRowSpan valid={index > 0} onClick={() => props.moveUp(value)} title="move up" value="▲" /></td>
                                <td><MoveRowSpan valid={index + 1 < values.length} onClick={() => props.moveDown(value)} title="move down" value="▼" /></td>
                                <td onClick={() => props.edit(value)} title="edit value">Edit</td>
                                <td onClick={() => props.delete(value)} title="delete value">Delete</td>
                            </tr>
                        ))
                }
            </tbody>
        </table>
    );
}