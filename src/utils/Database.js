import { indexedDB, localStorage, IDBKeyRange, getCurrentDate } from "./Global";

const DATABASE_NAME = 'MACRO_MEASURE_DB';
const DB_VERSION = parseInt('1'); // must be integer
const READ = 'readonly';
const READWRITE = 'readwrite';
export const GROUPS = 'groups';
export const WAYPOINTS = 'waypoints';
let db;

export const initDatabase = () => {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(DATABASE_NAME, DB_VERSION);
        openRequest.onupgradeneeded = upgradeDb;
        openRequest.onerror = (event) => {
            reject(`Database open error: ${event.target.error.message}`);
        };
        openRequest.onsuccess = async (event) => {
            db = event.target.result;
            await addLocalStorage();
            resolve(true);
        };
    });
};

export const getDatabaseAsObject = () => {
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
    return handle(objectStoreNames, action, READ);
};

export const deleteDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DATABASE_NAME);
        request.onerror = (event) => {
            reject(`Database delete error: ${event.target.error.message}`);
        };
        request.onsuccess = (event) => {
            resolve('database deleted');
        };
    });
};

const handle = (objectStoreNames, action, mode) => {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(objectStoreNames, mode);
        action(transaction, resolve);
        transaction.onerror = (event) => {
            reject(`transaction error: ${event.target.error.message}`);
        };
    });
};

const upgradeDb = (event) => {
    if (event.oldVersion < DB_VERSION) {
        const db = event.target.result;
        createObjectStores(db);
    }
};

const createObjectStores = (db) => {
    if (!db.objectStoreNames.includes(GROUPS)) {
        const groupsObjectStore = db.createObjectStore(GROUPS,
            { keyPath: 'id', autoIncrement: true });
        groupsObjectStore.createIndex('order', 'order', { unique: true });
        groupsObjectStore.createIndex('name', 'name', { unique: true });
    }
    if (!db.objectStoreNames.includes(WAYPOINTS)) {
        const waypointsObjectStore = db.createObjectStore(WAYPOINTS,
            { keyPath: 'id', autoIncrement: true });
        waypointsObjectStore.createIndex('order', ['parentItemID', 'order'], { unique: true });
        waypointsObjectStore.createIndex('parentItemID', ['parentItemID'], { unique: false });
        waypointsObjectStore.createIndex('name', ['parentItemID', 'name'], { unique: true });
    }
}

const addLocalStorage = () => {
    const promises = [];
    const groupsJSON = localStorage.getItem('groups');
    const waypointsJSON = localStorage.getItem('waypoints');
    if (groupsJSON) {
        promises.push(backfillGroups(JSON.parse(groupsJSON)));
    }
    if (waypointsJSON) {
        promises.push(backfillWaypoints(JSON.parse(waypointsJSON)));
    }
    return Promise.all(promises);
};

const backfillGroups = async (oldGroups) => {
    if (!oldGroups.length) {
        return;
    }
    const currentDate = getCurrentDate();
    const getUniqueItemName = (item, index) => (
        `${item.name}_imported_${currentDate}_${index}`
    );
    const dbGroups = oldGroups.map((group, index) => (
        { name: getUniqueItemName(group, index) }
    ));
    const oldGroupsByName = Object.fromEntries(oldGroups.map((group, index) => (
        [getUniqueItemName(group, index),group ]
    )));
    const createdGroupIDs = await createItems(GROUPS, dbGroups); // // { createdID: dbGroup, ... }
    const backfillWaypointsPromises = Object.entries(createdGroupIDs).map(([groupID, group]) => {
        const oldGroup = oldGroupsByName[group.name];
        if (!oldGroup.items) {
            return Promise.resolve();
        }
        const dbWaypoints = oldGroup.items.map((item, index) => (
            Object.assign({}, item, {
                name: getUniqueItemName(item, index),
                parentItemID: groupID,
            })
        ));
        return createItems(WAYPOINTS, dbWaypoints);
    });
    await Promise.all(backfillWaypointsPromises);
};

const backfillWaypoints = (oldWaypoints) => {
    const oldWaypointsByParentItemIDs = {};
    oldWaypoints.forEach((oldWaypoint) => {
        if (!(oldWaypoint.parentItemID in oldWaypointsByParentItemIDs)) {
            oldWaypointsByParentItemIDs[oldWaypoint.parentItemID] = [];
        }
        oldWaypointsByParentItemIDs[oldWaypoint.parentItemID].push(oldWaypoint);
    });
    const oldGroups = Object.entries(oldWaypointsByParentItemIDs)
        .map(([_, oldWaypoints], index) => ({
            name: index,
            items: oldWaypoints,
        }));
    return backfillGroups(oldGroups);
};

const createItems = async (objectStoreName, items) => {
    const parentItemID = items[0].parentItemID;
    const differentParentIDs = !items.every((element, index) => index === 0 || parentItemID === element.parentItemID);
    if (differentParentIDs) {
        throw new Error("different parent IDs among items");
    }
    const numItems = await readItemCount(objectStoreName, parentItemID);
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        let itemIDs = {};
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
    return handle([objectStoreName], action, READWRITE);
};

export const createItem = async (objectStoreName, item) => {
    const createItemIDs = await createItems(objectStoreName, [item]); // { createdID: item }
    return parseInt(Object.entries(createItemIDs)[0][0]);
};

export const readItem = (objectStoreName, itemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.get(itemID);
        request.onsuccess = (event) => {
            const item = event.target.result;
            resolve(item);
        };
    };
    return handle([objectStoreName], action, READ);
};

const readItemCount = (objectStoreName, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? IDBKeyRange.bound(
                [parentItemID, -Infinity],
                [parentItemID, +Infinity])
            : null;
        const request = index.count(range);
        request.onsuccess = (event) => {
            const count = event.target.result;
            resolve(count);
        };
    };
    return handle([objectStoreName], action, READ);
};

const readItemByOrder = (objectStoreName, order, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? IDBKeyRange.only([parentItemID, order])
            : IDBKeyRange.only(order);
        const request = index.get(range);
        request.onsuccess = (event) => {
            const item = event.target.result;
            resolve(item);
        };
    };
    return handle([objectStoreName], action, READ);
};

// TODO: rename readItems to readItemNames -> return [{itemID, parentItemID, order, name}...]
export const readItems = (objectStoreName, parentItemID) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentItemID)
            ? IDBKeyRange.bound(
                [parentItemID, -Infinity],
                [parentItemID, +Infinity])
            : null;
        const request = index.getAll(range);
        request.onsuccess = (event) => {
            const items = event.target.result;
            resolve(items);
        };
    };
    return handle([objectStoreName], action, READ);
};

export const updateItem = (objectStoreName, item) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.put(item);
        transaction.oncomplete = (event) => {
            resolve(true);
        };
    };
    return handle([objectStoreName], action, READWRITE);
};

export const deleteItem = async (objectStoreName, itemID) => {
    const cascadeObjectStoreKeys = await getCascadeObjectStoreNameItemIDs(objectStoreName, itemID);
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
    return handle(objectStoreNames, action, READWRITE);
};

const getCascadeObjectStoreNameItemIDs = (objectStoreName, itemID) => {
    if (objectStoreName === GROUPS) {
        const action = (transaction, resolve) => {
            const objectStore = transaction.objectStore(WAYPOINTS);
            const index = objectStore.index('parentItemID');
            const range = IDBKeyRange.only(itemID);
            const request = index.getAllKeys(range);
            request.onsuccess = async (event) => {
                const waypointItemIDs = event.target.result;
                const cascadeObjectStoreNameItemIDs = { [WAYPOINTS]: waypointItemIDs }
                resolve(cascadeObjectStoreNameItemIDs);
            };
        };
        return handle([WAYPOINTS], action, READ);
    }
    return {};
};

export const moveItemUp = (objectStoreName, item) => {
    return moveItem(objectStoreName, item, -1);
};

export const moveItemDown = (objectStoreName, item) => {
    return moveItem(objectStoreName, item, +1);
};

const moveItem = async (objectStoreName, item, delta) => {
    const order = item.order;
    const otherItem = await readItemByOrder(objectStoreName, order + delta, item.parentItemID);
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
    return handle([objectStoreName], action, READWRITE);
};