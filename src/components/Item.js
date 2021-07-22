import { useState, useEffect } from 'react';

import './Item.css';

import { useItems } from '../hooks/Database';

import { View } from '../utils/View';
import { Waypoint } from './Waypoint';

export const Item = (props) => {
    const [items, reloadItems] = useItems(props.db, props.objectStoreName, props.parentItemID);
    const [item, setItem] = useState(null);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);
    const [headerName, setHeaderName] = useState('?');
    useEffect(() => {
        if (props.itemID) {
            const itemsWithID = items?.filter((dbItem) => dbItem.id === props.itemID);
            const item2 = itemsWithID?.[0];
            setItem(item2);
        }
    }, [setItem, items, props.itemID]);
    useEffect(() => {
        setPrevDisabled(!item || item.order <= 0);
        setNextDisabled(!item || !items || item.order + 1 >= items.length);
    }, [setPrevDisabled, setNextDisabled, item, items]);
    useEffect(() => {
        const getItemName = () => (
            (item)
                ? item.name
                : '?'
        );
        const headerName2 = (View.isCreate(props.view))
            ? `[Add ${props.type}]`
            : getItemName();
        setHeaderName(headerName2);
    }, [setHeaderName, item, props.view, props.type]);
    const state = {
        prevDisabled, headerName, nextDisabled,
        item, setItem,
        items, reloadItems,
    }
    return render({ ...props, ...state });
};

const render = (props) => (
    <div className="Item">
        <div className="Item-Header">
            {getHeader(props)}
        </div>
        {getChild(props)}
    </div>
);

const getHeader = (props) => {
    const showEdit = View.isRead(props.view);
    return (
        <>
            <div className="row">
                <button
                    className="left arrow"
                    title={`previous ${props.type}`}
                    disabled={props.prevDisabled}
                    onClick={handleRead(-1, props)}
                >
                    <span>◀</span>
                </button>
                <button
                    className="name"
                    title={`${props.type} list`}
                    onClick={handleReadList(props)}
                >
                    <span>{props.headerName}</span>
                </button>
                <button
                    className="right arrow"
                    title={`next ${props.type}`}
                    disabled={props.nextDisabled}
                    onClick={handleRead(+1, props)}
                >
                    <span>▶</span>
                </button>
            </div>
            {
                showEdit &&
                <div className="row">
                    <button
                        title={`update ${props.type}`}
                        onClick={handleUpdateStart(props)}
                    >
                        <span>Edit...</span>
                    </button>
                    <button
                        title={`delete ${props.type}`}
                        onClick={handleDeleteStart(props)}
                    >
                        <span>Delete...</span>
                    </button>
                    <button
                        title={`create ${props.type}`}
                        onClick={handleCreateStart(props)}
                    >
                        <span>Add...</span>
                    </button>
                </div>
            }
        </>
    );
};

const getChild = (props) => (
    (
        children[props.type]
        || (() => (<p>{`ERROR: No child component for ${props.type}`}</p>))
    )(props)
);

const handleCreateStart = ({ createStart }) => () => {
    createStart();
};

const handleRead = (delta, { read, items, item }) => () => {
    items.forEach((item3) => {
        if (item3.order === item.order + delta) {
            read(item3);
        }
    })
};

const handleReadList = ({ list }) => () => {
    list();
};

const handleUpdateStart = ({ updateStart, item }) => () => {
    updateStart(item);
};

const handleDeleteStart = ({ deleteStart, item }) => () => {
    deleteStart(item);
};

const children = {
    'waypoint': (props) => (<Waypoint {...props} />), // TODO: Pass only necessary props (do not pass items)
    // 'map': TODO create map component
}
