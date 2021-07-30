import { useState, useEffect } from 'react';

import './Item.css';

import { useItems } from '../hooks/Database';

import { View } from '../utils/View';
import { Waypoint } from './Waypoint';
import { Map } from './Map';

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
        item, items, reloadItems,
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

const getChild = (props) => {
    return (
        children[props.type]
        || (() => (<p>{`ERROR: No child component for ${props.type}`}</p>))
    )(props);
};

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
    'waypoint': (props) => (<Waypoint
        view={props.view}
        type={props.type}
        item={props.item}
        parentItemID={props.parentItemID}
        reloadItems={props.reloadItems}
        distanceUnit={props.distanceUnit}
        highAccuracyGPS={props.highAccuracyGPS}
        setGPSOn={props.setGPSOn}
        createStart={props.createStart}
        createEnd={props.createEnd}
        read={props.read}
        list={props.list}
        updateStart={props.updateStart}
        updateEnd={props.updateEnd}
        deleteStart={props.deleteStart}
        deleteEnd={props.deleteEnd}
    />),
    'map': (props) => (<Map
        view={props.view}
        type={props.type}
        item={props.item}
        itemID={props.itemID}
        reloadItems={props.reloadItems}
        setGPSOn={props.setGPSOn}
        createStart={props.createStart}
        createEnd={props.createEnd}
        read={props.read}
        list={props.list}
        updateStart={props.updateStart}
        updateEnd={props.updateEnd}
        deleteStart={props.deleteStart}
        deleteEnd={props.deleteEnd}
    />),
};