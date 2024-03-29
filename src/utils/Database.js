import { getIndexedDB, getIDBKeyRange, getLocalStorage } from "./Global";

const DATABASE_NAME = 'MACRO_MEASURE_DB';
// version history:
// 2: initial version (groups, waypoints)
// 3: addition of maps object store
const DB_VERSION = parseInt('4'); // must be integer
const READ = 'readonly';
const READWRITE = 'readwrite';
export const GROUPS = 'groups';
export const WAYPOINTS = 'waypoints';

export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        const openRequest = getIndexedDB().open(DATABASE_NAME, DB_VERSION);
        openRequest.onupgradeneeded = upgradeDb;
        openRequest.onerror = (event) => {
            reject(`Database open error: ${event.target.error.message}`);
        };
        openRequest.onsuccess = async (event) => {
            const db = event.target.result;
            await addLocalStorage(db);
            resolve(db);
        };
    });
};

export const getAll = (db) => {
    const objectStoreNames = [GROUPS, WAYPOINTS];
    const action = (transaction, resolve) => {
        const objectStores = {};
        objectStoreNames.forEach((objectStoreName) => {
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const items = event.target.result;
                objectStores[objectStoreName] = items;
            };
        });
        transaction.oncomplete = (event) => {
            resolve(objectStores);
        };
    };
    return handle(db, objectStoreNames, action, READ);
};

export const deleteDatabase = async () => {
    return new Promise((resolve, reject) => {
        const request = getIndexedDB().deleteDatabase(DATABASE_NAME);
        request.onerror = (event) => {
            reject(`Database delete error: ${event.target.error.message}`);
        };
        request.onblocked = (event) => {
            resolve('database deleted');
        };
    });
};

const handle = (db, objectStoreNames, action, mode) => {
    return new Promise((resolve, reject) => {
        if (db) {
            const transaction = db.transaction(objectStoreNames, mode);
            action(transaction, resolve);
            transaction.onerror = (event) => {
                reject(`transaction error: ${event.target.error.message}`);
            };
        }
    });
};

const upgradeDb = (event) => {
    if (event.oldVersion < DB_VERSION) {
        const db = event.target.result;
        createObjectStores(db);
        const transaction = event.target.transaction;
        refreshIndexes(transaction);
    }
};

const createObjectStores = (db) => {
    if (!db.objectStoreNames.contains(GROUPS)) {
        db.createObjectStore(GROUPS, { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(WAYPOINTS)) {
        db.createObjectStore(WAYPOINTS, { keyPath: 'id', autoIncrement: true });
    }
};

const refreshIndexes = (transaction) => {
    const groupsObjectStore = transaction.objectStore(GROUPS);
    const waypointsObjectStore = transaction.objectStore(WAYPOINTS);
    [groupsObjectStore, waypointsObjectStore].forEach((objectStore) => {
        const indexNames = Array.from(objectStore.indexNames);
        indexNames.forEach((name) => {
            objectStore.deleteIndex(name);
        });
    });
    groupsObjectStore.createIndex('order', 'order', { unique: true });
    groupsObjectStore.createIndex('name', 'name', { unique: true });
    waypointsObjectStore.createIndex('order', ['parentItemID', 'order'], { unique: true });
    waypointsObjectStore.createIndex('parentItemID', ['parentItemID'], { unique: false });
    waypointsObjectStore.createIndex('name', ['parentItemID', 'name'], { unique: true });
};

const addLocalStorage = async (db) => {
    const oldGroups = getListFromLocalStorage(GROUPS);
    const oldWaypoints = getListFromLocalStorage(WAYPOINTS);
    if (oldGroups.length || oldWaypoints.length) {
        const existingGroups = await readItems(db, GROUPS);
        const groups = getGroupsToBackfill(existingGroups, oldGroups, oldWaypoints);
        await backfillGroups(db, groups);
    }
    getLocalStorage().removeItem(GROUPS);
    getLocalStorage().removeItem(WAYPOINTS);
};

const getListFromLocalStorage = (objectStoreName) => {
    const listJSON = getLocalStorage().getItem(objectStoreName);
    return listJSON ? JSON.parse(listJSON) : [];
}

const backfillGroups = async (db, oldGroups) => {
    const dbGroups = oldGroups.map((group) => ({ name: group.name }));
    const oldGroupsByName = Object.fromEntries(oldGroups.map((group) => ([group.name, group])));
    const createdGroupIDs = await createItems(db, GROUPS, dbGroups); // { createdID: dbGroup, ... }
    const backfillWaypointsPromises = Object.entries(createdGroupIDs).map(([groupID, group]) => {
        const oldGroup = oldGroupsByName[group.name];
        if (!oldGroup.items.length) {
            return Promise.resolve();
        }
        const dbWaypoints = oldGroup.items.map((item) => (
            Object.assign({}, item, {
                name: item.name,
                parentItemID: parseInt(groupID),
            })
        ));
        return createItems(db, WAYPOINTS, dbWaypoints);
    });
    await Promise.all(backfillWaypointsPromises);
};

const getGroupsToBackfill = (existingGroups, oldGroups, oldWaypoints) => {
    const groups = [];
    oldGroups.forEach((oldGroup) => {
        const items = [];
        oldGroup.items?.forEach((oldItem) => {
            const item = Object.assign({}, oldItem, { name: getUniqueName(items, oldItem.name) });
            items.push(item);
        });
        const group = {
            name: getUniqueName(existingGroups, oldGroup.name),
            items: items,
        };
        groups.push(group);
    });
    oldWaypoints.forEach((oldWaypoint) => {
        if (!oldGroups.some((oldGroup) => (oldGroup.id === oldWaypoint.parentItemID))) { // ensure there is a old group with the parent id
            const name = getUniqueName(oldGroups, 'group');
            oldGroups.push({
                name: name,
                id: oldWaypoint.parentItemID,
            });
            groups.push({ // mark the new 'old' group as a group to backfill
                name: name,
                items: [],
            });
        }
        // get the group to backfill by name
        const oldGroupsWithID = oldGroups.filter((oldGroup) => (oldGroup.id === oldWaypoint.parentItemID));
        const groupName = oldGroupsWithID[0].name;
        const group = groups.filter((group2) => (group2.name === groupName))[0];
        const waypoint = Object.assign({}, oldWaypoint, { name: getUniqueName(group.items, oldWaypoint.name) });
        group.items.push(waypoint);
    });
    return groups;
};

const getUniqueName = (existingNameObjects, name) => {
    let uniqueName = name;
    const hasName = (nameItems, n) => (
        nameItems.some((item) => item.name === n)
    );
    for (let i = 2; ; i++) {
        if (!hasName(existingNameObjects, uniqueName)) {
            break;
        }
        uniqueName = `${name}_${i}`;
    }
    return uniqueName;
};

const createItems = async (db, objectStoreName, items) => {
    const parentItemID = items[0].parentItemID; // it is assumed tha all items have the same parentItemID
    const numItems = await readItemCount(db, objectStoreName, parentItemID);
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const itemIDs = {};
        items.forEach((item, index) => {
            const dbItem = Object.assign({}, item, { order: numItems + index });
            const request = objectStore.add(dbItem);
            request.onsuccess = (event) => {
                const id = event.target.result;
                itemIDs[id] = item;
            };
        });
        transaction.oncomplete = (event) => {
            resolve(itemIDs);
        };
    };
    return handle(db, [objectStoreName], action, READWRITE);
};

export const createItem = async (db, objectStoreName, item) => {
    const createdItemIDs = await createItems(db, objectStoreName, [item]);
    return parseInt(Object.entries(createdItemIDs)[0][0]);
};

export const readItem = (db, objectStoreName, itemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.get(itemID);
        request.onsuccess = (event) => {
            const item = event.target.result;
            resolve(item);
        };
    };
    return handle(db, [objectStoreName], action, READ);
};

const readItemCount = (db, objectStoreName, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? getIDBKeyRange().bound(
                [parentItemID, -Infinity],
                [parentItemID, +Infinity])
            : null;
        const request = index.count(range);
        request.onsuccess = (event) => {
            const count = event.target.result;
            resolve(count);
        };
    };
    return handle(db, [objectStoreName], action, READ);
};

const readItemByOrder = (db, objectStoreName, order, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? getIDBKeyRange().only([parentItemID, order])
            : getIDBKeyRange().only(order);
        const request = index.get(range);
        request.onsuccess = (event) => {
            const item = event.target.result;
            resolve(item);
        };
    };
    return handle(db, [objectStoreName], action, READ);
};

export const readItems = (db, objectStoreName, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? getIDBKeyRange().bound(
                [parentItemID, -Infinity],
                [parentItemID, +Infinity])
            : null;
        const request = index.getAll(range);
        request.onsuccess = (event) => {
            const items = event.target.result;
            resolve(items);
        };
    };
    return handle(db, [objectStoreName], action, READ);
};

export const updateItem = (db, objectStoreName, item) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.put(item);
        transaction.oncomplete = (event) => {
            resolve(true);
        };
    };
    return handle(db, [objectStoreName], action, READWRITE);
};

export const deleteItem = async (db, objectStoreName, itemID) => {
    const cascadeObjectStoreKeys = await getCascadeObjectStoreNameItemIDs(db, objectStoreName, itemID);
    const objectStoreNames = [objectStoreName, ...Object.keys(cascadeObjectStoreKeys)];
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.delete(itemID);
        Object.entries(cascadeObjectStoreKeys).forEach(([cascadeObjectStoreName, cascadeObjectStoreItemIDs]) => {
            const cascadeObjectStore = transaction.objectStore(cascadeObjectStoreName);
            cascadeObjectStoreItemIDs.forEach((cascadeObjectStoreItemID) => {
                cascadeObjectStore.delete(cascadeObjectStoreItemID);
            });
        });
        transaction.oncomplete = async (event) => {
            resolve(true);
        };
    };
    return handle(db, objectStoreNames, action, READWRITE);
};

const getCascadeObjectStoreNameItemIDs = async (db, objectStoreName, itemID) => {
    if (objectStoreName === GROUPS) {
        const action = (transaction, resolve) => {
            const objectStore = transaction.objectStore(WAYPOINTS);
            const index = objectStore.index('parentItemID');
            const range = getIDBKeyRange().only(itemID);
            const request = index.getAllKeys(range);
            request.onsuccess = async (event) => {
                const waypointItemIDs = event.target.result;
                const cascadeObjectStoreNameItemIDs = { [WAYPOINTS]: waypointItemIDs }
                resolve(cascadeObjectStoreNameItemIDs);
            };
        };
        return handle(db, [WAYPOINTS], action, READ);
    }
    return {};
};

export const moveItemUp = (db, objectStoreName, item) => {
    return moveItem(db, objectStoreName, item, -1);
};

export const moveItemDown = (db, objectStoreName, item) => {
    return moveItem(db, objectStoreName, item, +1);
};

const moveItem = async (db, objectStoreName, item, delta) => {
    const order = item.order;
    const otherItem = await readItemByOrder(db, objectStoreName, order + delta, item.parentItemID);
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        item.order += delta;
        otherItem.order -= delta;
        const desiredOrder = item.order;
        item.order = -1; // database does not have deferrable constraints between put() calls in a transaction
        objectStore.put(Object.assign({}, item));
        objectStore.put(otherItem);
        item.order = desiredOrder;
        objectStore.put(item);
        transaction.oncomplete = (event) => {
            resolve(true);
        };
    };
    return handle(db, [objectStoreName], action, READWRITE);
};