export const NameTable = ({ type, values, read, update, deleteValue, moveUp, moveDown }) => (
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
            {getTableBody(values, read, update, deleteValue, moveUp, moveDown)}
        </tbody>
    </table>
);

const getTableBody = (values, read, update, deleteValue, moveUp, moveDown) => (
    (!values || values.length === 0)
        ? (<tr><td colSpan="5">No values exist.  Create one.</td></tr>)
        : tableRows(values, read, update, deleteValue, moveUp, moveDown)
);

const tableRows = (values, read, update, deleteValue, moveUp, moveDown) => (
    values.map((value, index) => (
        <tr key={value.name}>
            {tableCell(value.name, 'read value', true, read, index)}
            {tableCell('▲', 'move up', index > 0, moveUp, index)}
            {tableCell('▼', 'move down', index + 1 < values.length, moveDown, index)}
            {tableCell('Edit', 'update value', true, update, index)}
            {tableCell('Delete', 'delete value', true, deleteValue, index)}
        </tr>
    )));

const tableCell = (value, title, isVisible, fn, index) => (
    <td>
        {
            isVisible &&
            <button onClick={onClick(fn, index)} title={title}>
                <span>{value}</span>
            </button>
        }
    </td>
);

const onClick = (fn, index) => () => (
    fn(index)
);