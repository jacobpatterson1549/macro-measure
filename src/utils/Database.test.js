import { waitFor } from '@testing-library/react';

import { initDatabase, getDatabaseAsObject, deleteDatabase, createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from './Database';
import { indexedDB, localStorage, IDBKeyRange, getCurrentDate } from "./Global";

const mockIDBKeyRange = (lower, upper, lowerOpen, upperOpen) => (
    { lower, upper, lowerOpen, upperOpen }
);

jest.mock('./Global', () => ({
    indexedDB: {
        open: jest.fn(),
        deleteDatabase: jest.fn(),
    },
    localStorage: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    IDBKeyRange: {
        only: (z) => mockIDBKeyRange(z, z, false, false),
        bound: (x, y) => mockIDBKeyRange(x, y, false, false),
    },
    getCurrentDate: jest.fn(),
}));

// implements EventTarget, derived from MDN example
class MockEventTarget {
    constructor() {
        this.listeners = {};
    }
    addEventListener(type, callback) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }
    removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        this.listeners[type] = this.listeners[type]
            .filter((callbackI) => callbackI !== callback);
    }
    dispatchEvent(event) {
        this.listeners[event.type]
            ?.forEach((callback) => {
                callback.call(this, event);
            });
        return !event.defaultPrevented;
    }
}

// also implements IDBOpenDBRequest
class MockIDBRequest extends MockEventTarget {
    set onerror(callback) { this.addEventListener('error', callback); }
    set onsuccess(callback) { this.addEventListener('success', callback); }
}
class MockIDBOpenDBRequest extends MockIDBRequest {
    set onupgradeneeded(callback) { this.addEventListener('upgradeneeded', callback); }
}
class MockIDBTransaction extends MockEventTarget {
    constructor(...objectStores) {
        super();
        this.objectStores = {
            add: jest.fn(),
            count: jest.fn(),
        }
        this.objectStore = jest.fn();
        objectStores.forEach((objectStore) => {
            this.objectStore.mockReturnValueOnce(objectStore);
        });
    }
    set onerror(callback) { this.addEventListener('error', callback); }
    set oncomplete(callback) { this.addEventListener('complete', callback); }
}

const mockEvent = (type, target) => {
    const event = document.createEvent('Event');
    Object.defineProperties(event, {
        'type': { value: type },
        'target': { value: target },
    });
    return event;
};

const mockTransaction = async (...transactions) => {
    const openRequest = new MockIDBOpenDBRequest();
    indexedDB.open = () => openRequest;
    const db = {
        transaction: jest.fn(),
    };
    transactions.forEach((transaction) => {
        db.transaction.mockReturnValueOnce(transaction);
    });
    const event = mockEvent('success', { result: db });
    const request = initDatabase();
    openRequest.dispatchEvent(event);
    await request;
    return db;
};

describe('Database', () => {
    describe('initDatabase', () => {
        describe('onupgradeneeded', () => {
            const upgradeTests = [
                [2, -1],
                [0, Number.MAX_SAFE_INTEGER],
            ];
            it.each(upgradeTests)('should create %d object stores when version is %d', (expected, oldVersion) => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                const db = {
                    objectStoreNames: [],
                    createObjectStore: jest.fn().mockReturnValue({
                        createIndex: jest.fn(),
                    }),
                };
                const event = mockEvent('upgradeneeded', { result: db });
                Object.defineProperty(event, 'oldVersion', { value: oldVersion });
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(db.createObjectStore).toBeCalledTimes(expected);
            });
            const createObjectStoreCountTests = [
                [2, []],
                [2, ['unused', 'object', 'stores']],
                [1, ['groups']],
                [1, ['waypoints']],
                [0, ['waypoints', 'groups']],
            ]
            it.each(createObjectStoreCountTests)('should create %d object stores when object stores were previously %s', (expected, oldObjectStoresNames) => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                const db = {
                    objectStoreNames: oldObjectStoresNames,
                    createObjectStore: jest.fn().mockReturnValue({
                        createIndex: jest.fn(),
                    }),
                };
                const event = mockEvent('upgradeneeded', { result: db });
                Object.defineProperty(event, 'oldVersion', { value: -1 });
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(db.createObjectStore).toBeCalledTimes(expected);
            });
        });
        it('should reject with the error message when an error is thrown', () => {
            const openRequest = new MockIDBOpenDBRequest();
            indexedDB.open = () => openRequest;
            const expected = 'custom error massage';
            const event = mockEvent('error', { error: new Error(expected) });
            const request = initDatabase();
            openRequest.dispatchEvent(event);
            expect(request).rejects.toContain(expected);
        });
        describe('addLocalStorage', () => {
            it('should be load local storage when successful', () => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                const event = mockEvent('success', {});
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(localStorage.getItem.mock.calls).toEqual([['groups'], ['waypoints']]);
            });
            it('should backfill groups', async () => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                const groupsJSON = JSON.stringify([
                    {
                        name: 'group 1', // really old group with items
                        items: [
                            { name: 'item1', lat: 2, lng: 3 },
                            { name: 'item2', lat: 22, lng: 7 },
                        ],
                    },
                    {
                        name: 'group 1b', // should get second id
                    },
                    {
                        name: 'group 2', // older group with item
                        items: [{ name: 'item7', lat: 20, lng: 31 }],
                    },
                    {
                        name: 'group 3', // exported group or old group with no items
                    },
                ]);
                localStorage.getItem
                    .mockReturnValueOnce(groupsJSON)
                    .mockReturnValueOnce(null);
                const groupsCountRequest = new MockIDBRequest();
                const waypointsCountRequest = new MockIDBRequest();
                const groupsAddRequest1 = new MockIDBRequest();
                const groupsAddRequest1b = new MockIDBRequest();
                const groupsAddRequest2 = new MockIDBRequest();
                const groupsAddRequest3 = new MockIDBRequest();
                const waypointsAddRequest1 = new MockIDBRequest();
                const waypointsAddRequest2 = new MockIDBRequest();
                const waypointsAddRequest7 = new MockIDBRequest();
                const groupsOrderIndex = { count: jest.fn().mockReturnValue(groupsCountRequest) };
                const waypointsOrderIndex = { count: jest.fn().mockReturnValue(waypointsCountRequest) };
                const groupsObjectStore = {
                    index: jest.fn().mockReturnValue(groupsOrderIndex),
                    add: jest.fn()
                        .mockReturnValueOnce(groupsAddRequest1)
                        .mockReturnValueOnce(groupsAddRequest1b)
                        .mockReturnValueOnce(groupsAddRequest2)
                        .mockReturnValueOnce(groupsAddRequest3),
                };
                const waypointsObjectStore = {
                    index: jest.fn().mockReturnValue(waypointsOrderIndex),
                    add: jest.fn()
                        .mockReturnValueOnce(waypointsAddRequest1)
                        .mockReturnValueOnce(waypointsAddRequest2)
                        .mockReturnValueOnce(waypointsAddRequest7),
                };
                const groupsCountRange = null;
                const waypointsGroup1Range = IDBKeyRange.bound(['g1', -Infinity], ['g1', +Infinity], false, false);
                const waypointsGroup2Range = IDBKeyRange.bound(['g2', -Infinity], ['g2', +Infinity], false, false);
                const transactionGR = new MockIDBTransaction(groupsObjectStore);
                const transactionGW = new MockIDBTransaction(groupsObjectStore);
                const transactionWR1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWR2 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW2 = new MockIDBTransaction(waypointsObjectStore);
                transactionWW1.name = 'transactionWW1';
                transactionWW2.name = 'transactionWW2';
                const db = {
                    transaction: jest.fn()
                        .mockReturnValueOnce(transactionGR)
                        .mockReturnValueOnce(transactionGW)
                        .mockReturnValueOnce(transactionWR1)
                        .mockReturnValueOnce(transactionWR2)
                        .mockReturnValueOnce(transactionWW1)
                        .mockReturnValueOnce(transactionWW2),
                };
                getCurrentDate.mockReturnValue('XYZ');
                // actions
                const initRequest = initDatabase();
                openRequest.dispatchEvent(mockEvent('success', { result: db }));
                await waitFor(() => expect(db.transaction).toBeCalledWith(['groups'], 'readonly'));
                groupsCountRequest.dispatchEvent(mockEvent('success', { result: 111 }));
                await waitFor(() => expect(db.transaction).toBeCalledWith(['groups'], 'readwrite'));
                groupsAddRequest1.dispatchEvent(mockEvent('success', { result: 'g1' }));
                groupsAddRequest1b.dispatchEvent(mockEvent('success', { result: 'g1b' }));
                groupsAddRequest2.dispatchEvent(mockEvent('success', { result: 'g2' }));
                groupsAddRequest3.dispatchEvent(mockEvent('success', { result: 'g3' }));
                transactionGW.dispatchEvent(mockEvent('complete', {}));
                await waitFor(() => {
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i1, i2
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i7
                });
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i1, i2
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i7
                await waitFor(() => {
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i1, i2
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i7
                });
                waypointsAddRequest1.dispatchEvent(mockEvent('success', { result: 'i1' }));
                waypointsAddRequest2.dispatchEvent(mockEvent('success', { result: 'i2' }));
                waypointsAddRequest7.dispatchEvent(mockEvent('success', { result: 'i7' }));
                transactionWW1.dispatchEvent(mockEvent('complete', {}));
                transactionWW2.dispatchEvent(mockEvent('complete', {}));
                await initRequest;
                // checks
                expect(groupsObjectStore.index).toBeCalledWith('order');
                expect(groupsOrderIndex.count).toBeCalledWith(groupsCountRange);
                expect(groupsObjectStore.add.mock.calls).toEqual([
                    [{ name: 'group 1_imported_XYZ_0', order: 111 }],
                    [{ name: 'group 1b_imported_XYZ_1', order: 112 }],
                    [{ name: 'group 2_imported_XYZ_2', order: 113 }],
                    [{ name: 'group 3_imported_XYZ_3', order: 114 }],
                ]);
                expect(waypointsObjectStore.index.mock.calls).toEqual([['order'], ['order']]);
                expect(waypointsOrderIndex.count.mock.calls).toEqual([[waypointsGroup1Range], [waypointsGroup2Range]]);
                expect(waypointsObjectStore.add.mock.calls).toEqual([
                    [{ name: 'item1_imported_XYZ_0', lat: 2, lng: 3, order: 0, parentItemID: 'g1' }],
                    [{ name: 'item2_imported_XYZ_1', lat: 22, lng: 7, order: 1, parentItemID: 'g1' }],
                    [{ name: 'item7_imported_XYZ_0', lat: 20, lng: 31, order: 0, parentItemID: 'g2' }],
                ]);
            });
            it('should backfill waypoints', async () => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                const waypointsJSON = JSON.stringify([
                    { name: 'item1', lat: 2, lng: 3, parentItemID: 'a' },
                    { name: 'item2', lat: 22, lng: 7, parentItemID: 'a' },
                    { name: 'item7', lat: 20, lng: 31, parentItemID: 'b' },
                ]);
                localStorage.getItem
                    .mockReturnValueOnce(null)
                    .mockReturnValueOnce(waypointsJSON);
                const groupsCountRequest = new MockIDBRequest();
                const waypointsCountRequest = new MockIDBRequest();
                const groupsAddRequest1 = new MockIDBRequest();
                const groupsAddRequest2 = new MockIDBRequest();
                const waypointsAddRequest1 = new MockIDBRequest();
                const waypointsAddRequest2 = new MockIDBRequest();
                const waypointsAddRequest7 = new MockIDBRequest();
                const groupsOrderIndex = { count: jest.fn().mockReturnValue(groupsCountRequest) };
                const waypointsOrderIndex = { count: jest.fn().mockReturnValue(waypointsCountRequest) };
                const groupsObjectStore = {
                    index: jest.fn().mockReturnValue(groupsOrderIndex),
                    add: jest.fn()
                        .mockReturnValueOnce(groupsAddRequest1)
                        .mockReturnValueOnce(groupsAddRequest2),
                };
                const waypointsObjectStore = {
                    index: jest.fn().mockReturnValue(waypointsOrderIndex),
                    add: jest.fn()
                        .mockReturnValueOnce(waypointsAddRequest1)
                        .mockReturnValueOnce(waypointsAddRequest2)
                        .mockReturnValueOnce(waypointsAddRequest7),
                };
                const groupsCountRange = null;
                const waypointsGroup1Range = IDBKeyRange.bound(['g1', -Infinity], ['g1', +Infinity], false, false);
                const waypointsGroup2Range = IDBKeyRange.bound(['g2', -Infinity], ['g2', +Infinity], false, false);
                const transactionGR = new MockIDBTransaction(groupsObjectStore);
                const transactionGW = new MockIDBTransaction(groupsObjectStore);
                const transactionWR1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWR2 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW2 = new MockIDBTransaction(waypointsObjectStore);
                transactionWW1.name = 'transactionWW1';
                transactionWW2.name = 'transactionWW2';
                const db = {
                    transaction: jest.fn()
                        .mockReturnValueOnce(transactionGR)
                        .mockReturnValueOnce(transactionGW)
                        .mockReturnValueOnce(transactionWR1)
                        .mockReturnValueOnce(transactionWR2)
                        .mockReturnValueOnce(transactionWW1)
                        .mockReturnValueOnce(transactionWW2),
                };
                getCurrentDate.mockReturnValue('XYZ');
                // actions
                const initRequest = initDatabase();
                openRequest.dispatchEvent(mockEvent('success', { result: db }));
                await waitFor(() => expect(db.transaction).toBeCalledWith(['groups'], 'readonly'));
                groupsCountRequest.dispatchEvent(mockEvent('success', { result: 111 }));
                await waitFor(() => expect(db.transaction).toBeCalledWith(['groups'], 'readwrite'));
                groupsAddRequest1.dispatchEvent(mockEvent('success', { result: 'g1' }));
                groupsAddRequest2.dispatchEvent(mockEvent('success', { result: 'g2' }));
                transactionGW.dispatchEvent(mockEvent('complete', {}));
                await waitFor(() => {
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i1, i2
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i7
                });
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i1, i2
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i7
                await waitFor(() => {
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i1, i2
                    expect(db.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i7
                });
                waypointsAddRequest1.dispatchEvent(mockEvent('success', { result: 'i1' }));
                waypointsAddRequest2.dispatchEvent(mockEvent('success', { result: 'i2' }));
                waypointsAddRequest7.dispatchEvent(mockEvent('success', { result: 'i7' }));
                transactionWW1.dispatchEvent(mockEvent('complete', {}));
                transactionWW2.dispatchEvent(mockEvent('complete', {}));
                await initRequest;
                // checks
                expect(groupsObjectStore.index).toBeCalledWith('order');
                expect(groupsOrderIndex.count).toBeCalledWith(groupsCountRange);
                expect(groupsObjectStore.add.mock.calls).toEqual([
                    [{ name: '0_imported_XYZ_0', order: 111 }],
                    [{ name: '1_imported_XYZ_1', order: 112 }],
                ]);
                expect(waypointsObjectStore.index.mock.calls).toEqual([['order'], ['order']]);
                expect(waypointsOrderIndex.count.mock.calls).toEqual([[waypointsGroup1Range], [waypointsGroup2Range]]);
                expect(waypointsObjectStore.add.mock.calls).toEqual([
                    [{ name: 'item1_imported_XYZ_0', lat: 2, lng: 3, order: 0, parentItemID: 'g1' }],
                    [{ name: 'item2_imported_XYZ_1', lat: 22, lng: 7, order: 1, parentItemID: 'g1' }],
                    [{ name: 'item7_imported_XYZ_0', lat: 20, lng: 31, order: 0, parentItemID: 'g2' }],
                ]);
            });
            it('should backfill empty groups and waypoints', () => {
                const openRequest = new MockIDBOpenDBRequest();
                indexedDB.open = () => openRequest;
                localStorage.getItem
                    .mockReturnValueOnce('[]')
                    .mockReturnValueOnce('[]');
                const initRequest = initDatabase();
                const db = { transaction: jest.fn() };
                openRequest.dispatchEvent(mockEvent('success', { result: db }));
                expect(initRequest).resolves.toBeTruthy();
                expect(db.transaction).toBeCalledTimes(0);
            });
            // TODO: groups and waypoints
        });
        it('should resolve when successful', async () => {
            const openRequest = new MockIDBRequest();
            indexedDB.open = () => openRequest;
            const event = mockEvent('success', {});
            const request = initDatabase();
            openRequest.dispatchEvent(event);
            expect(request).resolves.toBeTruthy();
        });
    });
    describe('getDatabaseAsObject', () => {
        it('should resolve to object', () => {
            const groups = [1, 'art', true];
            const waypoints = [2, 'bat', false];
            const expected = {
                'groups': groups,
                'waypoints': waypoints,
            };
            const groupsGetAllRequest = new MockIDBRequest();
            const waypointsGetAllRequest = new MockIDBRequest();
            const groupsGetAllObjectStore = { getAll: () => groupsGetAllRequest };
            const waypointsGetAllObjectStore = { getAll: () => waypointsGetAllRequest };
            const transaction = new MockIDBTransaction(
                groupsGetAllObjectStore,
                waypointsGetAllObjectStore,
            );
            mockTransaction(transaction);
            const request = getDatabaseAsObject();
            groupsGetAllRequest.dispatchEvent(mockEvent('success', { result: groups }));
            waypointsGetAllRequest.dispatchEvent(mockEvent('success', { result: waypoints }));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(request).resolves.toEqual(expected);
        });
    });
    describe('deleteDatabase', () => {
        it('should reject when an error is thrown', () => {
            const deleteRequest = new MockIDBRequest();
            indexedDB.deleteDatabase = () => deleteRequest;
            const expected = 'db delete error';
            const event = mockEvent('error', { error: new Error(expected) });
            const request = deleteDatabase();
            deleteRequest.dispatchEvent(event);
            expect(request).rejects.toContain(expected);
        });
        it('should resolve when successful', () => {
            const deleteRequest = new MockIDBRequest();
            indexedDB.deleteDatabase = () => deleteRequest;
            const event = mockEvent('success', {});
            const request = deleteDatabase();
            deleteRequest.dispatchEvent(event);
            expect(request).resolves.toBeTruthy();
        });
    });
    describe('C.R.U.D. handlers', () => {
        it('should handle errors', async () => {
            const expected = 'mock key missing message';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItem('os1', 'key1');
            transaction.dispatchEvent(mockEvent('error', { error: new Error(expected) }));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly'],]);
            expect(request).rejects.toContain(expected);
        });
        const createItemTests = [
            [{ name: 'root item' }, null],
            [{ name: 'item with parent', parentItemID: 7 }, mockIDBKeyRange(
                [7, -Infinity],
                [7, Infinity],
                false,
                false,
            )],
        ];
        it.each(createItemTests)('should createItem when item is %s, using a range of %s', async (item, range) => {
            const expectedItemID = 5;
            const expectedCount = 93;
            const expectedItem = Object.assign({}, item, {
                order: expectedCount,
            });
            const countRequest = new MockIDBRequest();
            const orderIndex = {
                count: jest.fn().mockReturnValue(countRequest),
            };
            const addRequest = new MockIDBRequest();
            const objectStoreR = {
                index: jest.fn().mockReturnValue(orderIndex),
            };
            const objectStoreW = {
                add: jest.fn().mockReturnValue(addRequest),
            };
            const transactionR = new MockIDBTransaction(objectStoreR);
            const transactionW = new MockIDBTransaction(objectStoreW);
            const db = await mockTransaction(transactionR, transactionW);
            const request = createItem('os1', item);
            countRequest.dispatchEvent(mockEvent('success', { result: expectedCount }));
            await waitFor(() => expect(db.transaction.mock.calls).toEqual([
                [['os1'], 'readonly'],
                [['os1'], 'readwrite'],
            ]));
            addRequest.dispatchEvent(mockEvent('success', { result: expectedItemID }));
            transactionW.dispatchEvent(mockEvent('complete', {}));
            const actualItemID = await request;
            expect(objectStoreR.index).toBeCalledWith('order');
            expect(orderIndex.count).toBeCalledWith(range);
            expect(objectStoreW.add.mock.calls).toEqual([[expectedItem]]);
            expect(actualItemID).toEqual(expectedItemID);
        });
        it('should readItem', async () => {
            const expected = 'the desired item';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItem('os1', 'key1');
            getRequest.dispatchEvent(mockEvent('success', { result: expected }));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly']]);
            expect(objectStore.get).toBeCalledWith('key1');
            expect(request).resolves.toEqual(expected);
        });
        const readItemTests = [
            [null, null],
            [7, mockIDBKeyRange(
                [7, -Infinity],
                [7, Infinity],
                false,
                false,
            )],
        ];
        it.each(readItemTests)('should readItems when parentID is %s, using a range of %s', async (parentItemID, range) => {
            const expected = ['some items', 8];
            const getAllRequest = new MockIDBRequest();
            const orderIndex = {
                getAll: jest.fn().mockReturnValue(getAllRequest),
            };
            const objectStore = {
                index: jest.fn().mockReturnValue(orderIndex),
            };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItems('os1', parentItemID);
            getAllRequest.dispatchEvent(mockEvent('success', { result: expected }));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly']]);
            const actual = await request;
            expect(objectStore.index).toBeCalledWith('order');
            expect(orderIndex.getAll).toBeCalledWith(range);
            expect(actual).toEqual(expected);
        });
        it('should updateItem', async () => {
            const expected = 'the item being put, with key';
            const putRequest = new MockIDBRequest();
            const objectStore = { put: jest.fn().mockReturnValue(putRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = updateItem('os1', expected);
            putRequest.dispatchEvent(mockEvent('success', {}));
            transaction.dispatchEvent(mockEvent('complete', {}));
            await request;
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readwrite']]);
            expect(objectStore.put).toBeCalledWith(expected);
        });
        it('should deleteItem', async () => {
            const itemID = 'test id';
            const deleteRequest = new MockIDBRequest();
            const objectStore = { delete: jest.fn().mockReturnValue(deleteRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = deleteItem('child_object_store', itemID);
            await waitFor(() => expect(db.transaction.mock.calls).toEqual([[['child_object_store'], 'readwrite']]));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(objectStore.delete).toBeCalledWith(itemID);
            expect(request).resolves.toBeTruthy();
        });
        it('should deleteItem for group and cascade delete waypoints', async () => {
            const groupID = 'test id';
            const range = IDBKeyRange.only(groupID);
            const getAllKeysRequest = new MockIDBRequest();
            const parentItemIDIndex = { getAllKeys: jest.fn().mockReturnValue(getAllKeysRequest) };
            const objectStoreR = { index: jest.fn().mockReturnValue(parentItemIDIndex) };
            const objectStoreGW = { delete: jest.fn() };
            const objectStoreWW = { delete: jest.fn() };
            const transactionR = new MockIDBTransaction(objectStoreR);
            const transactionW = new MockIDBTransaction(objectStoreGW, objectStoreWW);
            const db = await mockTransaction(transactionR, transactionW);
            const request = deleteItem('groups', groupID);
            getAllKeysRequest.dispatchEvent(mockEvent('success', { result: [7, 8, 14] }));
            transactionW.dispatchEvent(mockEvent('complete', {}));
            await waitFor(() => expect(db.transaction.mock.calls).toEqual([
                [['waypoints'], 'readonly'],
                [['groups', 'waypoints'], 'readwrite'],
            ]));
            expect(parentItemIDIndex.getAllKeys).toBeCalledWith(range)
            expect(objectStoreGW.delete).toBeCalledWith(groupID);
            expect(objectStoreWW.delete.mock.calls).toEqual([[7], [8], [14]]);
            expect(request).resolves.toBeTruthy();
        });
        describe('moveItem', () => {
            const moveItemTests = [
                ['down', { name: 'src', order: 1 }, IDBKeyRange.only(2), { name: 'dst', order: 2 }, moveItemDown],
                ['up', { name: 'src', order: 7 }, IDBKeyRange.only(6), { name: 'dst', order: 6 }, moveItemUp],
                ['down', { name: 'src', order: 9, parentItemID: 6 }, IDBKeyRange.only([6, 10]), { name: 'dst', order: 10, parentItemID: 6 }, moveItemDown],
                ['up', { name: 'src', order: 4, parentItemID: 9 }, IDBKeyRange.only([9, 3]), { name: 'dst', order: 3, parentItemID: 9 }, moveItemUp],
            ];
            it.each(moveItemTests)('should moveItem %s when item is %s using a range of %s', async (direction, srcItem, range, dstItem, moveItem) => {
                const expected = [
                    [Object.assign({}, srcItem, { order: -1 })],
                    [Object.assign({}, dstItem, { order: srcItem.order })],
                    [Object.assign({}, srcItem, { order: dstItem.order })],
                ];
                const getRequest = new MockIDBRequest();
                const orderIndex = {
                    get: jest.fn().mockReturnValue(getRequest),
                };
                const putRequest = new MockIDBRequest();
                const objectStoreR = {
                    index: jest.fn().mockReturnValue(orderIndex),
                };
                const objectStoreW = {
                    put: jest.fn().mockReturnValue(putRequest),
                };
                const transactionR = new MockIDBTransaction(objectStoreR);
                const transactionW = new MockIDBTransaction(objectStoreW);
                const db = await mockTransaction(transactionR, transactionW);
                const request = moveItem('os1', srcItem);
                getRequest.dispatchEvent(mockEvent('success', { result: dstItem }));
                await waitFor(() => expect(db.transaction.mock.calls).toEqual([
                    [['os1'], 'readonly'],
                    [['os1'], 'readwrite'],
                ]));
                transactionW.dispatchEvent(mockEvent('complete', {}));
                await request;
                expect(objectStoreR.index).toBeCalledWith('order');
                expect(orderIndex.get).toBeCalledWith(range);
                expect(objectStoreW.put.mock.calls).toEqual(expected);
            });
        });
    });
});