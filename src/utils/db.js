const DATABASE_NAME = 'MACRO_MEASURE_DB';
const DB_VERSION = parseInt('1'); // must be integer
const READ = 'readonly';
const READWRITE = 'readwrite';
export const GROUPS = 'groups';
export const WAYPOINTS = 'waypoints';

export const initDatabase = () => {
    const indexedDB = window.indexedDB;
    const openRequest = indexedDB.open(DATABASE_NAME, DB_VERSION);
    openRequest.onupgradeneeded = upgradeDb;
    openRequest.onerror = (event) => {
        throw new Error(`Database open error: ${event.target.error.message}`)
    };
    openRequest.onsuccess = (event) => {
        const db = event.target.result;
        addLocalStorage(db);
    };
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
        const indexedDB = window.indexedDB;
        const openRequest = indexedDB.open(DATABASE_NAME, DB_VERSION);
        openRequest.onupgradeneeded = upgradeDb;
        openRequest.onerror = (event) => {
            reject(`Database open error: ${event.target.error.message}`);
        };
        openRequest.onsuccess = (event) => {
            const db = event.target.result;
            var transaction = db.transaction(objectStoreNames, mode);
            action(transaction, resolve);
            transaction.onerror = (event) => {
                reject(`transaction error: ${event.target.error.message}`);
            };
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
            { keyPath: 'key', autoIncrement: true });
        groupsObjectStore.createIndex('order', 'order', { unique: false });
    }
    if (!db.objectStoreNames.contains(WAYPOINTS)) {
        const waypointsObjectStore = db.createObjectStore(WAYPOINTS,
            { keyPath: 'key', autoIncrement: true });
        waypointsObjectStore.createIndex('order', ['parentKey', 'order'], { unique: true });
        waypointsObjectStore.createIndex('parentKey', ['parentKey'], { unique: false });
    }
}

const addLocalStorage = (db) => {
    const promises = [];
    const groupsJSON = window.localStorage.getItem('groups');
    const waypointsJSON = window.localStorage.getItem('waypoints');
    if (groupsJSON) {
        promises.push(new Promise((resolve, reject) => backfillGroups(db, JSON.parse(groupsJSON), resolve, reject)));
    }
    if (waypointsJSON) {
        promises.push(new Promise((resolve, reject) => backfillWaypoints(db, JSON.parse(waypointsJSON), resolve, reject)));
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
                parentKey: dbGroups[groupIndex].result,
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
    oldWaypoints.forEach((parentKey, index) => {
        waypoints.add({
            name: parentKey.name,
            lat: parentKey.lat,
            lng: parentKey.lng,
            order: index,
            parentKey: parentKey.parentKey,
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
    const numItems = await readItemCount(objectStoreName, item.parentKey);
    const dbItem = Object.assign({}, item, { order: numItems });
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.add(dbItem);
        request.onsuccess = async (event) => {
            const items = await readItems(objectStoreName, dbItem.parentKey);
            resolve(items);
        };
    };
    return handle(objectStoreName, action, READWRITE);
};

export const readItem = (objectStoreName, key) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.get(key);
        request.onsuccess = (event) => {
            const item = event.target.result;
            resolve(item);
        };
    };
    return handle([objectStoreName], action, READ);
};

const readItemCount = (objectStoreName, parentKey) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentKey)
            ? IDBKeyRange.bound(
                [parentKey, -Infinity],
                [parentKey, +Infinity])
            : null;
        const request = index.count(range);
        request.onsuccess = (event) => {
            const count = event.target.result;
            resolve(count);
        };
    };
    return handle([objectStoreName], action, READ);
};

const readItemByOrder = (objectStoreName, order, parentKey) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentKey)
            ? IDBKeyRange.only([parentKey, order])
            : IDBKeyRange.only(order);
        const request = index.getAll(range);
        request.onsuccess = (event) => {
            const items = event.target.result;
            resolve(items[0]);
        };
    };
    return handle([objectStoreName], action, READ);
};

// TODO: rename readItems to readItemNames -> return [{key, parentKey, order, name}]
export const readItems = (objectStoreName, parentKey) => {
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        const index = objectStore.index('order');
        const range = (parentKey)
            ? IDBKeyRange.bound(
                [parentKey, -Infinity],
                [parentKey, +Infinity])
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
        const request = objectStore.put(item);
        request.onsuccess = async (event) => {
            const items = await readItems(objectStoreName, item.parentKey);
            resolve(items);
        };
    };
    return handle([objectStoreName], action, READWRITE);
};

export const deleteItem = async (objectStoreName, item) => {
    const cascadeObjectStoreKeys = await getCascadeObjectStoreNameKeys(objectStoreName, item)
    const objectStoreNames = [objectStoreName, ...Object.keys(cascadeObjectStoreKeys)];
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        objectStore.delete(item.key);
        Object.entries(cascadeObjectStoreKeys).forEach(([cascadeObjectStoreName, cascadeObjectStoreKeys]) => {
            const cascadeObjectStore = transaction.objectStore(cascadeObjectStoreName);
            cascadeObjectStoreKeys.forEach((cascadeObjectStoreKey) => {
                cascadeObjectStore.delete(cascadeObjectStoreKey)
            });
        });
        transaction.oncomplete = async (event) => {
            const items = await readItems(objectStoreName, item.parentKey);
            resolve(items);
        };
    };
    return handle(objectStoreNames, action, READWRITE);
};

const getCascadeObjectStoreNameKeys = (objectStoreName, item) => {
    if (objectStoreName === GROUPS) {
        const action = (transaction, resolve) => {
            const objectStore = transaction.objectStore(WAYPOINTS);
            const index = objectStore.index('parentKey');
            const range = IDBKeyRange.only(item.key);
            const request = index.getAllKeys(range);
            request.onsuccess = async (event) => {
                const waypointKeys = event.target.result;
                const cascadeObjectStoreNameKeys = { [WAYPOINTS]: waypointKeys }
                resolve(cascadeObjectStoreNameKeys);
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
    const otherItem = await readItemByOrder(objectStoreName, order + delta, item.parentKey);
    const action = (transaction, resolve) => {
        const objectStore = transaction.objectStore(objectStoreName);
        item.order += delta;
        otherItem.order -= delta;
        objectStore.put(item);
        objectStore.put(otherItem);
        transaction.oncomplete = async (event) => {
            const items = await readItems(objectStoreName, item.parentKey);
            resolve(items);
        };
    };
    return handle([objectStoreName], action, READWRITE);
};