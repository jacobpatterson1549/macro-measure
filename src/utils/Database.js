const DATABASE_NAME = 'MACRO_MEASURE_DB';
const DB_VERSION = parseInt('1'); // must be integer
const READ = 'readonly';
const READWRITE = 'readwrite';
export const GROUPS = 'groups';
export const WAYPOINTS = 'waypoints';
let db

export const initDatabase = () => {
    const indexedDB = window.indexedDB;
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(DATABASE_NAME, DB_VERSION);
        openRequest.onupgradeneeded = upgradeDb;
        openRequest.onerror = (event) => {
            reject(`Database open error: ${event.target.error.message}`)
        };
        openRequest.onsuccess = (event) => {
            db = event.target.result;
            addLocalStorage(db);
            resolve();
        };
    });
};

export const getDatabaseJSON = () => {
    const objectStoreNames = [GROUPS, WAYPOINTS];
    const action = (transaction, resolve) => {
        const objectStores = {};
        objectStoreNames.forEach((objectStoreName) => {
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const items = event.target.result;
                objectStores[objectStoreName] = items
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
        const indexedDB = window.indexedDB;
        const request = indexedDB.deleteDatabase(DATABASE_NAME);
        request.onerror = (event) => {
            reject(`Database delete error: ${event.target.error.message}`)
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
    if (!db.objectStoreNames.contains(GROUPS)) {
        const groupsObjectStore = db.createObjectStore(GROUPS,
            { keyPath: 'id', autoIncrement: true });
        groupsObjectStore.createIndex('order', 'order', { unique: true });
        groupsObjectStore.createIndex('name', 'name', { unique: true });
    }
    if (!db.objectStoreNames.contains(WAYPOINTS)) {
        const waypointsObjectStore = db.createObjectStore(WAYPOINTS,
            { keyPath: 'id', autoIncrement: true });
        waypointsObjectStore.createIndex('order', ['parentItemID', 'order'], { unique: true });
        waypointsObjectStore.createIndex('parentItemID', ['parentItemID'], { unique: false });
        waypointsObjectStore.createIndex('name', ['parentItemID', 'name'], { unique: true });
    }
}

const addLocalStorage = (db) => {
    const promises = [];
    const groupsJSON = window.localStorage.getItem('groups');
    const waypointsJSON = window.localStorage.getItem('waypoints');
    if (groupsJSON) {
        promises.push(new Promise((resolve, reject) => {
            backfillGroups(db, JSON.parse(groupsJSON), resolve, reject);
        }));
    }
    if (waypointsJSON) {
        promises.push(new Promise((resolve, reject) => {
            backfillWaypoints(db, JSON.parse(waypointsJSON), resolve, reject);
        }));
    }
    return Promise.all(promises);
};

const backfillGroups = (db, oldGroups, resolve, reject) => {
    const groupTransaction = db.transaction(GROUPS, READWRITE);
    const groups = groupTransaction.objectStore(GROUPS);
    const dbGroups = oldGroups.map((group, index) => (
        groups.add({
            name: group.name,
            order: index,
        })
    ));
    groupTransaction.commit();
    groupTransaction.onerror = (event) => {
        reject(`backfill groups error: ${event.target.error.message}`);
    };
    groupTransaction.oncomplete = (event) => {
        backfillGroupItems(db, oldGroups, dbGroups, resolve, reject);
    };
};

const backfillGroupItems = (db, oldGroups, dbGroups, resolve, reject) => {
    const waypointsTransaction = db.transaction(WAYPOINTS, READWRITE);
    const waypoints = waypointsTransaction.objectStore(WAYPOINTS);
    oldGroups.forEach((group, groupIndex) => {
        group.items?.forEach((item, itemIndex) => {
            waypoints.add({
                name: item.name,
                lat: item.lat,
                lng: item.lng,
                order: itemIndex,
                parentItemID: dbGroups[groupIndex].result,
            })
        });
    });
    waypointsTransaction.onerror = (event) => {
        reject(`backfill old items error: ${event.target.error.message}`);
    };
    waypointsTransaction.oncomplete = (event) => {
        window.localStorage.removeItem('groups');
        resolve();
    };
};

const backfillWaypoints = (db, oldWaypoints, resolve, reject) => {
    const waypointsTransaction = db.transaction(WAYPOINTS, READWRITE);
    const waypoints = waypointsTransaction.objectStore(WAYPOINTS);
    oldWaypoints.forEach((waypoint, index) => {
        waypoints.add({
            name: waypoint.name,
            lat: waypoint.lat,
            lng: waypoint.lng,
            order: index,
            // TODO: feature: add new group for each group of waypoints ?  (this ensures parentItemID exists)
            parentItemID: waypoint.itemID,
        });
    });
    waypointsTransaction.onerror = (event) => {
        reject(`backfill waypoints error: ${event.target.error.message}`);
    };
    waypointsTransaction.oncomplete = (event) => {
        window.localStorage.removeItem('waypoints');
        resolve();
    };
};

export const createItem = async (objectStoreName, item) => {
    const numItems = await readItemCount(objectStoreName, item.parentItemID);
    const dbItem = Object.assign({}, item, { order: numItems });
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.add(dbItem);
        let itemID;
        request.onsuccess = (event) => {
            const id = event.target.result;
            itemID = id;
        };
        transaction.oncomplete = (event) => {
            resolve(itemID);
        };
    };
    return handle(objectStoreName, action, READWRITE);
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
            resolve();
        };
    };
    return handle([objectStoreName], action, READWRITE);
};

export const deleteItem = async (objectStoreName, itemID) => {
    const cascadeObjectStoreKeys = await getCascadeObjectStoreNameItemIDs(objectStoreName, itemID)
    const objectStoreNames = [objectStoreName, ...Object.keys(cascadeObjectStoreKeys)];
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.delete(itemID);
        Object.entries(cascadeObjectStoreKeys).forEach(([cascadeObjectStoreName, cascadeObjectStoreItemIDs]) => {
            const cascadeObjectStore = transaction.objectStore(cascadeObjectStoreName);
            cascadeObjectStoreItemIDs.forEach((cascadeObjectStoreItemID) => {
                cascadeObjectStore.delete(cascadeObjectStoreItemID)
            });
        });
        transaction.oncomplete = async (event) => {
            resolve();
        };
    };
    return handle(objectStoreNames, action, READWRITE);
};

const getCascadeObjectStoreNameItemIDs = (objectStoreName, item) => {
    if (objectStoreName === GROUPS) {
        const action = (transaction, resolve) => {
            const objectStore = transaction.objectStore(WAYPOINTS);
            const index = objectStore.index('parentItemID');
            const range = IDBKeyRange.only(item.id);
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
        objectStore.put(item);
        objectStore.put(otherItem);
        item.order = desiredOrder;
        objectStore.put(item);
        transaction.oncomplete = (event) => {
            resolve();
        };
    };
    return handle([objectStoreName], action, READWRITE);
};