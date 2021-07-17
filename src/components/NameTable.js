import './NameTable.css';

export const NameTable = (props) => (
    <table className="Table">
        <caption>{props.type} items</caption>
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
            {getTableBody(props)}
        </tbody>
    </table>
);

const getTableBody = ({ items, reloadItems, read, update, deleteValue, moveUp, moveDown }) => (
    (!items) ? <></>
        : (items.length)
            ? tableRows(items, reloadItems, read, update, deleteValue, moveUp, moveDown)
            : (<tr><td colSpan="5">No items exist.  Create one.</td></tr>)
);

const tableRows = (items, reloadItems, read, update, deleteValue, moveUp, moveDown) => (
    items.map((item, index) => (
        <tr
            className="Row"
            key={item.id}
        >
            {tableCell(item.name, 'read value', true, read, item, reloadItems)}
            {tableCell('▲', 'move up', index > 0, moveUp, item, reloadItems)}
            {tableCell('▼', 'move down', index + 1 < items.length, moveDown, item, reloadItems)}
            {tableCell('Edit', 'update value', true, update, item, reloadItems)}
            {tableCell('Delete', 'delete value', true, deleteValue, item, reloadItems)}
        </tr>
    )));

const tableCell = (value, title, isVisible, action, item, reloadItems) => (
    <td className="Cell">
        {
            isVisible &&
            <button
                title={title} className="FakeButton"
                onClick={handleOnClick(action, item, reloadItems)}
            >
                <span>{value}</span>
            </button>
        }
    </td>
);

const handleOnClick = (action, item, reloadItems) => async () => {
    await action(item);
    reloadItems();
};