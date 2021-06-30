import { useState, useEffect, useRef } from 'react';

import { View } from '../utils/View';
import { createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from '../utils/Database';

// TODO rename "viewType" to be more clear that it is a function: (viewId) => bool
export const createHandlers = (objectStoreName, setItemID, setView, viewType) => ({
    createStart: () => actionHandler(setView, viewType, View.isCreate),
    createEnd: (item) => actionHandler(setView, viewType, View.isRead, async () => {
        const newID = await createItem(objectStoreName, item);
        setItemID(newID);
    }),
    read: (item) => actionHandler(setView, viewType, View.isRead, () => setItemID(item.id)),
    list: () => actionHandler(setView, viewType, View.isList),
    updateStart: (item) => actionHandler(setView, viewType, View.isUpdate, setItemID, item.id),
    updateEnd: (item) => actionHandler(setView, viewType, View.isRead, updateItem, objectStoreName, item),
    deleteStart: (item) => actionHandler(setView, viewType, View.isDelete, setItemID, item.id),
    deleteEnd: (item) => actionHandler(setView, viewType, View.isList, deleteItem, objectStoreName, item.id),
    moveUp: (item) => actionHandler(setView, viewType, View.isList, moveItemUp, objectStoreName, item),
    moveDown: (item) => actionHandler(setView, viewType, View.isList, moveItemDown, objectStoreName, item),
});

export const useItem = (objectStoreName, itemID) => (
    useDatabase(readItem, objectStoreName, itemID)
);

export const useItems = (objectStoreName, parentItemID) => (
    useDatabase(readItems, objectStoreName, parentItemID)
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

const useDatabase = (readFn, objectStoreName, filter) => {
    const [value, setValue] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const reloadValue = () => setUpdateCount((c) => c + 1);
    let isMounted = useRef(true);
    useEffect(() => {
        const loadFromDatabase = async () => {
            isMounted.current = true;
            const dbValue = await readFn(objectStoreName, filter);
            if (isMounted.current) {
                setValue(dbValue);
            }
        }
        loadFromDatabase();
        return () => isMounted.current = false;
    }, [setValue, isMounted, updateCount, readFn, objectStoreName, filter]);
    return [value, reloadValue];
};