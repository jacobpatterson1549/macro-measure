import { useState, useEffect, useRef } from 'react';

import { View } from '../utils/View';
import { createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from '../utils/Database';

// TODO rename "viewType" to be more clear that it is a function: (viewId) => bool
export const createHandlers = (db, objectStoreName, setItemID, setView, viewType) => ({
    createStart: () => actionHandler(setView, viewType, View.isCreate, setItemID, Number.MAX_SAFE_INTEGER),
    createEnd: (item) => actionHandler(setView, viewType, View.isRead, async () => {
        const newID = await createItem(db, objectStoreName, item);
        setItemID(newID);
    }),
    read: (item) => actionHandler(setView, viewType, View.isRead, setItemID, item.id),
    list: () => actionHandler(setView, viewType, View.isList),
    updateStart: (item) => actionHandler(setView, viewType, View.isUpdate, setItemID, item.id),
    updateEnd: (item) => actionHandler(setView, viewType, View.isRead, updateItem, db, objectStoreName, item),
    deleteStart: (item) => actionHandler(setView, viewType, View.isDelete, setItemID, item.id),
    deleteEnd: (item) => actionHandler(setView, viewType, View.isList, deleteItem, db, objectStoreName, item.id),
    moveUp: (item) => actionHandler(setView, viewType, View.isList, moveItemUp, db, objectStoreName, item),
    moveDown: (item) => actionHandler(setView, viewType, View.isList, moveItemDown, db, objectStoreName, item),
});

export const useItem = (db, objectStoreName, itemID) => (
    useDatabase(readItem, db, objectStoreName, itemID)
);

export const useItems = (db, objectStoreName, parentItemID) => (
    useDatabase(readItems, db, objectStoreName, parentItemID)
);

const actionHandler = async (setView, viewType, viewAction, action, ...params) => {
    const viewID = getView(viewType, viewAction);
    setView(viewID);
    if (action) {
        return await action(...params);
    }
};

const getView = (type, action) => (
    View.AllIDs
        .filter(type)
        .filter(action)[0]
);

const useDatabase = (readFn, db, objectStoreName, filter) => {
    const [value, setValue] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const reloadValue = () => setUpdateCount((c) => c + 1);
    let isMounted = useRef(true);
    useEffect(() => {
        const loadFromDatabase = async () => {
            isMounted.current = true;
            const dbValue = await readFn(db, objectStoreName, filter);
            if (isMounted.current) {
                setValue(dbValue);
            }
        };
        loadFromDatabase();
        return () => isMounted.current = false;
    }, [setValue, isMounted, updateCount, readFn, db, objectStoreName, filter]);
    return [value, reloadValue];
};