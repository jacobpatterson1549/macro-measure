const onClick = (fn, index) => () => fn(index);

const tableCell = (value, title, cond, fn, index) => (
    <td>
        {
            cond &&
            <button onClick={onClick(fn, index)} title={title}>
                <span>{value}</span>
            </button>
        }
    </td>
);

export const NameTable = ({
    type, //: the display name of the type of value in the table
    values, //: array of objects, each of which should have a 'name' attribute.  The names should be unique.
    read,  // function that is call when a value's name is clicked
    update, // function to edit a value
    deleteValue, // function to delete a value
    moveUp, // function to decrease the index of the value
    moveDown, // function to increase the index of the value
}) => {
    const _mapValues = () => (
        values.map((value, index) => (
            <tr key={value.name}>
                {tableCell(value.name, 'select value', true, read, index)}
                {tableCell('▲', 'move up', index > 0, moveUp, index)}
                {tableCell('▼', 'move down', index + 1 < values.length, moveDown, index)}
                {tableCell('Edit', 'edit value', true, update, index)}
                {tableCell('Delete', 'delete value', true, deleteValue, index)}
            </tr>
        )));
    const _tbody = (!values || values.length === 0)
        ? (<tr><td colSpan="5">No values exist.  Create one.</td></tr>)
        : _mapValues();
    return (
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
                {_tbody}
            </tbody>
        </table>
    );
};