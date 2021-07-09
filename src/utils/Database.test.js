import { waitFor } from '@testing-library/react';

import { initDatabase, getDatabaseAsObject, deleteDatabase, createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from './Database';
import { indexedDB, localStorage, IDBKeyRange } from "./Global";

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
        only: (z) =>  mockIDBKeyRange(z, z, false, false),
        bound: (x, y) => mockIDBKeyRange(x, y, false, false),
    },
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
            it.skip('should backfill groups', () => {
                // const groups = [
                //     {
                //         name: 'really old group with items',
                //         items: [
                //             {
                //                 name: 'item1',
                //                 lat: 2,
                //                 lng: 3,
                //             },
                //             {
                //                 name: 'item2',
                //                 lat: 22,
                //                 lng: 7,
                //             },
                //         ],
                //     },
                //     {
                //         name: 'exported group',
                //     },
                // ];
                //     const groupsJSON = JSON.stringify(groups);
                //     localStorage.getItem.mockReturnValueOnce(groupsJSON).mockReturnValueOnce();
                //     const groupsCountObjectStore = new MockObjectStore();
                //     const groupsAddObjectStore = new MockObjectStore();
                //     const waypointsAddObjectStore = new MockObjectStore();
                //     const transaction = new MockIDBTransaction(groupsCountObjectStore, groupsAddObjectStore, waypointsAddObjectStore);
                //     mockTransaction(transaction);
                //     groupsCountObjectStore.dispatchEvent(mockEvent('success', { result: 32 }));
                //     groupsAddObjectStore.dispatchEvent(mockEvent('success', {}));
                //     waypointsAddObjectStore.dispatchEvent(mockEvent('success', {}));
                //     expect(transaction.objectStore.mock.calls).toBe([
                //         ['groups', 'readonly'], // count
                //         ['groups', 'readwrite'], // add
                //         ['waypoints, readwrite'], // add
                //     ]);
                //     expect(groupsAddObjectStore.add.mock.calls).toBe([
                //         [{ name: 'really old group with items', order: 32 }],
                //         [{ name: 'exported group', order: 33 }],
                //     ]);
                //     expect(waypointsAddObjectStore.add.mock.calls).toBe([[{
                //             name: 'item1',
                //             lat: 2,
                //             lng: 3,
                //             order: 0,
                //             parentItemID: 612,
                //     }]]);
            });
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
        it('should handle errors', () => {
            const expected = 'mock key missing message';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            mockTransaction(transaction);
            const request = readItem('os1', 'key1');
            transaction.dispatchEvent(mockEvent('error', { error: new Error(expected) }));
            expect(request).rejects.toContain(expected);
        });
        it('should createItem', () => {
            //TODO
        });
        it('should readItem', () => {
            const expected = 'the desired item';
            const getRequest = new MockIDBRequest();
            const objectStore = { get: jest.fn().mockReturnValue(getRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            mockTransaction(transaction);
            const request = readItem('os1', 'key1');
            getRequest.dispatchEvent(mockEvent('success', { result: expected }));
            transaction.dispatchEvent(mockEvent('complete', {}));
            expect(objectStore.get).toBeCalledWith('key1');
            expect(request).resolves.toEqual(expected);
        });
        it('should readItems', () => {
            //TODO
        });
        it('should updateItem', async () => {
            const expected = 'the item being put, with key';
            const putRequest = new MockIDBRequest();
            const objectStore = { put: jest.fn().mockReturnValue(putRequest) };
            const transaction = new MockIDBTransaction(objectStore);
            mockTransaction(transaction);
            const request = updateItem('os1', expected);
            putRequest.dispatchEvent(mockEvent('success', {}));
            transaction.dispatchEvent(mockEvent('complete', {}));
            await request;
            expect(objectStore.put).toBeCalledWith(expected);
        });
        it('should deleteItem', () => {
            //TODO
            // * basic delete
            // * cascading delete
        });
        describe('moveItem', () => {
            const moveItemTests = [
                ['down', moveItemDown, 1, 2],
                ['up', moveItemUp, 2, 1],
            ];
            it.each(moveItemTests)('should moveItem %s', async (direction, moveItem, srcOrder, dstOrder) => {
                const srcItem = {
                    name: 'srcItem',
                    order: srcOrder,
                };
                const dstItem = {
                    name: 'dstItem',
                    order: dstOrder,
                };
                const expected = [
                    [{ name: 'srcItem', order: -1 }],
                    [{ name: 'dstItem', order: srcOrder }],
                    [{ name: 'srcItem', order: dstOrder }],
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
                const range = IDBKeyRange.only(dstOrder);
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