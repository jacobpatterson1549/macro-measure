import { render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import { createHandlers, useItem, useItems } from './Database';

import { GROUPS, WAYPOINTS, createItem, readItem, readItems, updateItem, deleteItem, moveItemUp, moveItemDown } from '../utils/Database';
import { View } from '../utils/View';

jest.mock('../utils/Database', () => ({
    createItem: jest.fn(),
    readItem: jest.fn(),
    readItems: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    moveItemUp: jest.fn(),
    moveItemDown: jest.fn(),
}));

describe('Database', () => {
    describe('createHandlers', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        const testData = {
            objectStoreNames: [GROUPS, WAYPOINTS],
            viewType: [View.isGroup, View.isWaypoint],
            handlerParams: { // [inParams, outParams]
                createStart: [[], []],
                createEnd: [['item'], ['item']],
                read: [[{ id: 'id' }], ['id']],
                list: [[], []],
                updateStart: [[{ id: 'id' }], ['id']],
                updateEnd: [['item'], ['item']],
                deleteStart: [[{ id: 'id' }], ['id']],
                deleteEnd: [[{ id: 'id' }], ['id']],
                moveUp: [['item'], ['item']],
                moveDown: [['item'], ['item']],
            },
            expectedViews: {
                createStart: [View.Group_Create, View.Waypoint_Create],
                createEnd: [View.Group_Read, View.Waypoint_Read],
                read: [View.Group_Read, View.Waypoint_Read],
                list: [View.Group_List, View.Waypoint_List],
                updateStart: [View.Group_Update, View.Waypoint_Update],
                updateEnd: [View.Group_Read, View.Waypoint_Read],
                deleteStart: [View.Group_Delete, View.Waypoint_Delete],
                deleteEnd: [View.Group_List, View.Waypoint_List],
                moveUp: [View.Group_List, View.Waypoint_List],
                moveDown: [View.Group_List, View.Waypoint_List],
            },
            expectedSetItemIDActions: [
                'read',
                'updateStart',
                'deleteStart',
            ],
            expectedDatabaseActions: {
                createEnd: createItem,
                updateEnd: updateItem,
                deleteEnd: deleteItem,
                moveUp: moveItemUp,
                moveDown: moveItemDown,
            },
        };
        describe.each(testData.objectStoreNames.map((objectStoreName, index) => [objectStoreName, index]))('%s', (objectStoreName, index) => {
            it.each(Object.entries(testData.expectedViews))('should set correct view when calling %s', (handlerFuncName, views) => {
                const setItemID = jest.fn();
                const setView = jest.fn();
                const viewType = testData.viewType[index];
                const params = testData.handlerParams[handlerFuncName];
                const [inParams] = params;
                const handlers = createHandlers(objectStoreName, setItemID, setView, viewType);
                const expected = views[index];
                handlers[handlerFuncName](...inParams);
                expect(setView).toBeCalledWith(expected);
            });
            it.each(testData.expectedSetItemIDActions)('should setItemID when calling %s', (handlerFuncName) => {
                const setItemID = jest.fn();
                const setView = jest.fn();
                const viewType = testData.viewType[index];
                const params = testData.handlerParams[handlerFuncName];
                const [inParams, outParams] = params
                const handlers = createHandlers(objectStoreName, setItemID, setView, viewType);
                const expected = outParams;
                handlers[handlerFuncName](...inParams);
                expect(setItemID).toBeCalledWith(...expected);
            });
            it.each(Object.entries(testData.expectedDatabaseActions))('should call %s with correct params', (handlerFuncName, databaseFunc) => {
                const setItemID = jest.fn();
                const setView = jest.fn();
                const viewType = testData.viewType[index];
                const params = testData.handlerParams[handlerFuncName];
                const [inParams, outParams] = params
                const handlers = createHandlers(objectStoreName, setItemID, setView, viewType);
                const expected = [objectStoreName, ...outParams];
                handlers[handlerFuncName](...inParams);
                expect(databaseFunc).toBeCalledWith(...expected);
            });
        });
    });
    describe('useDatabase', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        describe('useItem', () => {
            it('should have have item', async () => {
                const objectStoreName = 'os1';
                const filter = 'f1';
                const expected = 'value1'
                readItem.mockReturnValue(expected);
                const { result } = renderHook(() => useItem(objectStoreName, filter));
                expect(result.current[0]).toBeFalsy();
                await waitFor(() => expect(readItem).toBeCalledWith(objectStoreName, filter));
                const value = result.current[0];
                expect(value).toBe(expected);
            });
        });
        describe('useItems', () => {
            it('should have have items', async () => {
                const objectStoreName = 'os2';
                const filter = 'f2';
                const expected = 'value2'
                readItems.mockReturnValue(expected);
                const { result } = renderHook(() => useItems(objectStoreName, filter));
                await waitFor(() => expect(readItems).toBeCalledWith(objectStoreName, filter));
                const value = result.current[0];
                expect(value).toBe(expected);
            });
            it('should have have updated items when reloadValue is triggered', async () => {
                const objectStoreName = 'os3';
                const filter = 'f3';
                const initialItems = 'value3'; // will be overwritten after button is clicked
                const expected = 'value4';
                readItems.mockReturnValueOnce(initialItems).mockReturnValueOnce(expected);
                const { result } = renderHook(() => useItems(objectStoreName, filter));
                const reloadValue = result.current[1];
                await waitFor(reloadValue);
                const value = result.current[0];
                expect(value).toBe(expected);
            });
            it('should not cause unmounted component to re-render', () => {
                const objectStoreName = 'os4';
                const filter = 'f4';
                let lateResolve;
                const longRead = new Promise((resolve) => lateResolve = resolve);
                readItems.mockReturnValue(longRead);
                const { unmount } = renderHook(() => useItems(objectStoreName, filter));
                unmount(); // the test will throw an error from the late resolve
                lateResolve();
            });
        });
    });
});