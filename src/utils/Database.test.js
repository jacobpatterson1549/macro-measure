import { waitFor } from '@testing-library/react';

import { initDatabase, getAll, deleteDatabase, createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from './Database';
import { getIndexedDB, getIDBKeyRange, getCurrentDate, getLocalStorage } from "./Global";

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
        this.objectStore = jest.fn();
        objectStores.forEach((objectStore) => {
            this.objectStore.mockReturnValueOnce(objectStore);
        });
    }
    set onerror(callback) { this.addEventListener('error', callback); }
    set oncomplete(callback) { this.addEventListener('complete', callback); }
}

const mockEvent = (type, target) => ({ type, target });

const mockTransaction = async (...transactions) => {
    const openRequest = new MockIDBOpenDBRequest();
    getIndexedDB().open = () => openRequest;
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

const mockDOMStringList = (array) => {
    let i = 0;
    const list = {
        length: array?.length || 0,
        item: () => array?.toString() || '[]',
        contains: (item) => array?.includes(item) || false,
    };
    list[Symbol.iterator] = () => ({ // implement the iterator protocol
        next: () => ({
            done: i >= list.length,
            value: array?.[i++],
        }),
    });
    return list;
};

const mockUpgradeObjectStore = (indexNames) => {
    const expectedDeleteIndexCalls = indexNames?.map((indexName) => (
        [indexName]
    )) || [];
    indexNames = mockDOMStringList(indexNames);
    const createIndex = jest.fn();
    const deleteIndex = jest.fn().mockImplementation(() => {
        expect(createIndex).not.toHaveBeenCalled(); // ensure create called before delete
    });
    return { indexNames, expectedDeleteIndexCalls, deleteIndex, createIndex };
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
                getIndexedDB().open = () => openRequest;
                const db = {
                    objectStoreNames: mockDOMStringList(),
                    createObjectStore: jest.fn().mockReturnValue({
                        createIndex: jest.fn(),
                    }),
                };
                const transaction = new MockIDBTransaction(mockUpgradeObjectStore(), mockUpgradeObjectStore());
                const event = mockEvent('upgradeneeded', { result: db, transaction: transaction });
                event.oldVersion = oldVersion;
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
                getIndexedDB().open = () => openRequest;
                const db = {
                    objectStoreNames: mockDOMStringList(oldObjectStoresNames),
                    createObjectStore: jest.fn().mockReturnValue({
                        createIndex: jest.fn(),
                    }),
                };
                const transaction = new MockIDBTransaction(mockUpgradeObjectStore(), mockUpgradeObjectStore());
                const event = mockEvent('upgradeneeded', { result: db, transaction: transaction });
                event.oldVersion = -1;
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(db.createObjectStore).toBeCalledTimes(expected);
            });
            const oldIndexesTests = [
                [{}],
                [{ 'groups': ['a', 'b', 'c'] }],
                [{ 'groups': ['a'], 'waypoints': ['a'] }],
            ];
            it.each(oldIndexesTests)('should remove remove old indexes and create new ones when old indexes are %s', (oldIndexes) => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
                const groupsObjectStore = mockUpgradeObjectStore(oldIndexes['groups']);
                const waypointsObjectStore = mockUpgradeObjectStore(oldIndexes['waypoints']);
                const transaction = new MockIDBTransaction(groupsObjectStore, waypointsObjectStore);
                const db = {
                    objectStoreNames: mockDOMStringList(),
                    createObjectStore: jest.fn().mockReturnValue({
                        createIndex: jest.fn(),
                    }),
                };
                const event = mockEvent('upgradeneeded', { result: db, transaction: transaction });
                event.oldVersion = 0;
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(groupsObjectStore.deleteIndex.mock.calls).toEqual(groupsObjectStore.expectedDeleteIndexCalls);
                expect(waypointsObjectStore.deleteIndex.mock.calls).toEqual(waypointsObjectStore.expectedDeleteIndexCalls);
                // the expectations below are fragile and will need to be changed when more indexes are added or removed
                expect(groupsObjectStore.createIndex).toHaveBeenCalledTimes(2);
                expect(waypointsObjectStore.createIndex).toHaveBeenCalledTimes(3);
            });
        });
        it('should reject with the error message when an error is thrown', () => {
            const openRequest = new MockIDBOpenDBRequest();
            getIndexedDB().open = () => openRequest;
            const expected = 'custom error massage';
            const event = mockEvent('error', { error: new Error(expected) });
            const request = initDatabase();
            openRequest.dispatchEvent(event);
            expect(request).rejects.toContain(expected);
        });
        describe('addLocalStorage', () => {
            it('should load local storage when successful', () => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
                const event = mockEvent('success', {});
                initDatabase();
                openRequest.dispatchEvent(event);
                expect(getLocalStorage().getItem.mock.calls).toEqual([['groups'], ['waypoints']]);
            });
            it('should backfill groups', async () => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
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
                getLocalStorage().getItem
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
                const waypointsGroup1Range = getIDBKeyRange().bound([1, -Infinity], [1, +Infinity], false, false);
                const waypointsGroup2Range = getIDBKeyRange().bound([2, -Infinity], [2, +Infinity], false, false);
                const transactionGR = new MockIDBTransaction(groupsObjectStore);
                const transactionGW = new MockIDBTransaction(groupsObjectStore);
                const transactionWR1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW1 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWR2 = new MockIDBTransaction(waypointsObjectStore);
                const transactionWW2 = new MockIDBTransaction(waypointsObjectStore);
                transactionWW1.name = 'transactionWW1';
                transactionWW2.name = 'transactionWW2';
                const mockDB = {
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
                openRequest.dispatchEvent(mockEvent('success', { result: mockDB }));
                await waitFor(() => expect(mockDB.transaction).toBeCalledWith(['groups'], 'readonly'));
                groupsCountRequest.dispatchEvent(mockEvent('success', { result: 111 }));
                await waitFor(() => expect(mockDB.transaction).toBeCalledWith(['groups'], 'readwrite'));
                groupsAddRequest1.dispatchEvent(mockEvent('success', { result: 1 }));
                groupsAddRequest1b.dispatchEvent(mockEvent('success', { result: 11 }));
                groupsAddRequest2.dispatchEvent(mockEvent('success', { result: 2 }));
                groupsAddRequest3.dispatchEvent(mockEvent('success', { result: 3 }));
                transactionGW.dispatchEvent(mockEvent('complete', {}));
                await waitFor(() => {
                    expect(mockDB.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i1, i2
                    expect(mockDB.transaction).toBeCalledWith(['waypoints'], 'readonly'); // i7
                });
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i1, i2
                waypointsCountRequest.dispatchEvent(mockEvent('success', { result: 0 })); // i7
                await waitFor(() => {
                    expect(mockDB.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i1, i2
                    expect(mockDB.transaction).toBeCalledWith(['waypoints'], 'readwrite'); // i7
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
                    [{ name: 'group 1, imported XYZ 0', order: 111 }],
                    [{ name: 'group 1b, imported XYZ 1', order: 112 }],
                    [{ name: 'group 2, imported XYZ 2', order: 113 }],
                    [{ name: 'group 3, imported XYZ 3', order: 114 }],
                ]);
                expect(waypointsObjectStore.index.mock.calls).toEqual([['order'], ['order']]);
                expect(waypointsOrderIndex.count.mock.calls).toEqual([[waypointsGroup1Range], [waypointsGroup2Range]]);
                expect(waypointsObjectStore.add.mock.calls).toEqual([
                    [{ name: 'item1, imported XYZ 0', lat: 2, lng: 3, order: 0, parentItemID: 1 }],
                    [{ name: 'item2, imported XYZ 1', lat: 22, lng: 7, order: 1, parentItemID: 1 }],
                    [{ name: 'item7, imported XYZ 0', lat: 20, lng: 31, order: 0, parentItemID: 2 }],
                ]);
            });
            it('should backfill waypoints', async () => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
                const waypointsJSON = JSON.stringify([
                    { name: 'item1', lat: 2, lng: 3, parentItemID: 'a' },
                    { name: 'item2', lat: 22, lng: 7, parentItemID: 'a' },
                    { name: 'item7', lat: 20, lng: 31, parentItemID: 'b' },
                ]);
                getLocalStorage().getItem
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
                const waypointsGroup1Range = getIDBKeyRange().bound([1, -Infinity], [1, +Infinity], false, false);
                const waypointsGroup2Range = getIDBKeyRange().bound([2, -Infinity], [2, +Infinity], false, false);
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
                groupsAddRequest1.dispatchEvent(mockEvent('success', { result: 1 }));
                groupsAddRequest2.dispatchEvent(mockEvent('success', { result: 2 }));
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
                    [{ name: '0, imported XYZ 0', order: 111 }],
                    [{ name: '1, imported XYZ 1', order: 112 }],
                ]);
                expect(waypointsObjectStore.index.mock.calls).toEqual([['order'], ['order']]);
                expect(waypointsOrderIndex.count.mock.calls).toEqual([[waypointsGroup1Range], [waypointsGroup2Range]]);
                expect(waypointsObjectStore.add.mock.calls).toEqual([
                    [{ name: 'item1, imported XYZ 0', lat: 2, lng: 3, order: 0, parentItemID: 1 }],
                    [{ name: 'item2, imported XYZ 1', lat: 22, lng: 7, order: 1, parentItemID: 1 }],
                    [{ name: 'item7, imported XYZ 0', lat: 20, lng: 31, order: 0, parentItemID: 2 }],
                ]);
            });
            it('should backfill empty groups and waypoints', () => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
                getLocalStorage().getItem
                    .mockReturnValueOnce('[]')
                    .mockReturnValueOnce('[]');
                const initRequest = initDatabase();
                const db = { transaction: jest.fn() };
                openRequest.dispatchEvent(mockEvent('success', { result: db }));
                expect(initRequest).resolves.toBeTruthy();
                expect(db.transaction).toBeCalledTimes(0);
            });
            const removeTests = [
                ['groups', ['[]', null]],
                ['waypoints', [null, '[]']],
            ];
            it.each(removeTests)('should remove localStorage for %s', async (expected, getItemReturnValues) => {
                const openRequest = new MockIDBOpenDBRequest();
                getIndexedDB().open = () => openRequest;
                getItemReturnValues.forEach((value) => {
                    getLocalStorage().getItem.mockReturnValueOnce(value);
                });
                const initRequest = initDatabase();
                const db = { transaction: jest.fn() };
                openRequest.dispatchEvent(mockEvent('success', { result: db }));
                await initRequest;
                expect(getLocalStorage().removeItem).toBeCalledWith(expected);
            })
        });
        it('should resolve when successful', async () => {
            const openRequest = new MockIDBRequest();
            getIndexedDB().open = () => openRequest;
            const expected = 'the database created by init'
            const event = mockEvent('success', { result: expected });
            const request = initDatabase();
            openRequest.dispatchEvent(event);
            expect(request).resolves.toBe(expected);
        });
    });
    describe('getAll', () => {
        it('should resolve to object', async () => {
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
            const db = await mockTransaction(transaction);
            const request = getAll(db);
            groupsGetAllRequest.dispatchEvent(mockEvent('success', { result: groups }));
            waypointsGetAllRequest.dispatchEvent(mockEvent('success', { result: waypoints }));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(request).resolves.toEqual(expected);
        });
    });
    describe('deleteDatabase', () => {
        it('should reject when an error is thrown', () => {
            const deleteRequest = new MockIDBRequest();
            getIndexedDB().deleteDatabase = () => deleteRequest;
            const expected = 'db delete error';
            const event = mockEvent('error', { error: new Error(expected) });
            const request = deleteDatabase();
            deleteRequest.dispatchEvent(event);
            expect(request).rejects.toContain(expected);
        });
        it('should resolve when successful', () => {
            const deleteRequest = new MockIDBRequest();
            getIndexedDB().deleteDatabase = () => deleteRequest;
            const event = mockEvent('success', {});
            const request = deleteDatabase();
            deleteRequest.dispatchEvent(event);
            expect(request).resolves.toBeTruthy();
        });
    });
    describe('C.R.U.D. handlers', () => {
        it('should have previously called initDB', () => { // KEEP THIS TEST FIRST, or reset the module between tests
            const expected = 'call initDatabase() first';
            const db = null;
            const request = readItem(db, 'os1', 'key1');
            expect(request).rejects.toContain(expected);
        });
        it('should handle transaction errors', async () => {
            const expected = 'mock key missing message';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItem(db, 'os1', 'key1');
            transaction.dispatchEvent(mockEvent('error', { error: new Error(expected) }));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly'],]);
            expect(request).rejects.toContain(expected);
        });
        const createItemTests = [
            [{ name: 'root item' }, () => null],
            [{ name: 'item with parent', parentItemID: 7 }, () => getIDBKeyRange().bound([7, -Infinity], [7, Infinity])],
        ];
        it.each(createItemTests)('should createItem when item is %s, using a range of %s', async (item, rangeFn) => {
            const expectedItemID = 5;
            const expectedCount = 93;
            const expectedRange = rangeFn();
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
            const request = createItem(db, 'os1', item);
            countRequest.dispatchEvent(mockEvent('success', { result: expectedCount }));
            await waitFor(() => expect(db.transaction.mock.calls).toEqual([
                [['os1'], 'readonly'],
                [['os1'], 'readwrite'],
            ]));
            addRequest.dispatchEvent(mockEvent('success', { result: expectedItemID }));
            transactionW.dispatchEvent(mockEvent('complete', {}));
            const actualItemID = await request;
            expect(objectStoreR.index).toBeCalledWith('order');
            expect(orderIndex.count).toBeCalledWith(expectedRange);
            expect(objectStoreW.add.mock.calls).toEqual([[expectedItem]]);
            expect(actualItemID).toEqual(expectedItemID);
        });
        it('should readItem', async () => {
            const expected = 'the desired item';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItem(db, 'os1', 'key1');
            getRequest.dispatchEvent(mockEvent('success', { result: expected }));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly']]);
            expect(objectStore.get).toBeCalledWith('key1');
            expect(request).resolves.toEqual(expected);
        });
        const readItemTests = [
            [null, () => null],
            [7, () => getIDBKeyRange().bound([7, -Infinity], [7, Infinity])],
        ];
        it.each(readItemTests)('should readItems when parentID is %s, using a range of %s', async (parentItemID, rangeFn) => {
            const expectedRange = rangeFn();
            const expectedItems = ['some items', 8];
            const getAllRequest = new MockIDBRequest();
            const orderIndex = {
                getAll: jest.fn().mockReturnValue(getAllRequest),
            };
            const objectStore = {
                index: jest.fn().mockReturnValue(orderIndex),
            };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = readItems(db, 'os1', parentItemID);
            getAllRequest.dispatchEvent(mockEvent('success', { result: expectedItems }));
            expect(db.transaction.mock.calls).toEqual([[['os1'], 'readonly']]);
            const actual = await request;
            expect(objectStore.index).toBeCalledWith('order');
            expect(orderIndex.getAll).toBeCalledWith(expectedRange);
            expect(actual).toEqual(expectedItems);
        });
        it('should updateItem', async () => {
            const expected = 'the item being put, with key';
            const putRequest = new MockIDBRequest();
            const objectStore = { put: jest.fn().mockReturnValue(putRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            const db = await mockTransaction(transaction);
            const request = updateItem(db, 'os1', expected);
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
            const request = deleteItem(db, 'child_object_store', itemID);
            await waitFor(() => expect(db.transaction.mock.calls).toEqual([[['child_object_store'], 'readwrite']]));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(objectStore.delete).toBeCalledWith(itemID);
            expect(request).resolves.toBeTruthy();
        });
        it('should deleteItem for group and cascade delete waypoints', async () => {
            const groupID = 'test id';
            const range = getIDBKeyRange().only(groupID);
            const getAllKeysRequest = new MockIDBRequest();
            const parentItemIDIndex = { getAllKeys: jest.fn().mockReturnValue(getAllKeysRequest) };
            const objectStoreR = { index: jest.fn().mockReturnValue(parentItemIDIndex) };
            const objectStoreGW = { delete: jest.fn() };
            const objectStoreWW = { delete: jest.fn() };
            const transactionR = new MockIDBTransaction(objectStoreR);
            const transactionW = new MockIDBTransaction(objectStoreGW, objectStoreWW);
            const db = await mockTransaction(transactionR, transactionW);
            const request = deleteItem(db, 'groups', groupID);
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
            const rangeOnly = (x) => getIDBKeyRange().only(x, x, false, false);
            const moveItemTests = [
                ['down', { name: 'src', order: 1 }, () => rangeOnly(2), { name: 'dst', order: 2 }, moveItemDown],
                ['up', { name: 'src', order: 7 }, () => rangeOnly(6), { name: 'dst', order: 6 }, moveItemUp],
                ['down', { name: 'src', order: 9, parentItemID: 6 }, () => rangeOnly([6, 10]), { name: 'dst', order: 10, parentItemID: 6 }, moveItemDown],
                ['up', { name: 'src', order: 4, parentItemID: 9 }, () => rangeOnly([9, 3]), { name: 'dst', order: 3, parentItemID: 9 }, moveItemUp],
            ];
            it.each(moveItemTests)('should moveItem %s when item is %s using a range of %s', async (direction, srcItem, rangeFn, dstItem, moveItem) => {
                const expectedRange = rangeFn();
                const expectedPuts = [
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
                const request = moveItem(db, 'os1', srcItem);
                getRequest.dispatchEvent(mockEvent('success', { result: dstItem }));
                await waitFor(() => expect(db.transaction.mock.calls).toEqual([
                    [['os1'], 'readonly'],
                    [['os1'], 'readwrite'],
                ]));
                transactionW.dispatchEvent(mockEvent('complete', {}));
                await request;
                expect(objectStoreR.index).toBeCalledWith('order');
                expect(orderIndex.get).toBeCalledWith(expectedRange);
                expect(objectStoreW.put.mock.calls).toEqual(expectedPuts);
            });
        });
    });
});