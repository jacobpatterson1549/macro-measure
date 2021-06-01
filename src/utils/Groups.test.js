import { Groups } from '../utils/Groups';

describe('Groups', () => {
    describe('groups', () => {
        describe('create', () => {
            it('should return the groups', () => {
                const groups = [];
                const expected = [{ "name": "groupA", "items": [] }];
                const actual = Groups.createGroup(groups, 'groupA');
                expect(actual).toStrictEqual(expected);
            });
            it('should not overwrite other group, but add to end', () => {
                const groups = [{ "name": "groupA", "items": [true] }];
                const expected = [{ "name": "groupA", "items": [true] }, { "name": "groupB", "items": [] }];
                const actual = Groups.createGroup(groups, 'groupB');
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input groups', () => {
                const groups = [];
                const actual = Groups.createGroup(groups, 'groupA');
                expect(actual).not.toEqual(groups);
            });
        });
        describe('update', () => {
            describe('rename', () => {
                it('should', () => {
                    const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                    const expected = [{ "name": "groupA-EDITED", "items": [123] }, { "name": "groupB", "items": [] }];
                    const actual = Groups.updateGroup(groups, 0, 'groupA-EDITED');
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input groups', () => {
                    const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                    const actual = Groups.updateGroup(groups, 0, 'groupA-EDITED');
                    expect(actual).not.toEqual(groups);
                });
                it('should not update name of missing group', () => {
                    const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                    const expected = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                    const actual = Groups.updateGroup(groups, 3, 'groupC-EDITED');
                    expect(actual).toStrictEqual(expected);
                });
                it('should return the groups when updated', () => {
                    const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                    const expected = [{ "name": "groupA", "items": [123] }, { "name": "groupB-EDITED", "items": [] }];
                    const actual = Groups.updateGroup(groups, 1, 'groupB-EDITED');
                    expect(actual).toStrictEqual(expected);
                });
            });
            describe("move", () => {
                it('should move up', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const expected = [{ "name": "groupB" }, { "name": "groupA" }];
                    const actual = Groups.moveGroupUp(groups, 1);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not move up if at top', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const expected = [{ "name": "groupA" }, { "name": "groupB" }];
                    const actual = Groups.moveGroupUp(groups, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input groups', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const actual = Groups.moveGroupUp(groups, 1);
                    expect(actual).not.toEqual(groups);
                });
                it('should not move up if index too large', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const expected = [{ "name": "groupA" }, { "name": "groupB" }];
                    const actual = Groups.moveGroupUp(groups, 3);
                    expect(actual).toStrictEqual(expected);
                });
                it('should move down', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const expected = [{ "name": "groupB" }, { "name": "groupA" }];
                    const actual = Groups.moveGroupDown(groups, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input groups', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const actual = Groups.moveGroupDown(groups, 0);
                    expect(actual).not.toEqual(groups);
                });
                it('should not move down if at bottom', () => {
                    const groups = [{ "name": "groupA" }, { "name": "groupB" }];
                    const expected = [{ "name": "groupA" }, { "name": "groupB" }];
                    const actual = Groups.moveGroupDown(groups, 1);
                    expect(actual).toStrictEqual(expected);
                });
            });
        });
        describe('delete', () => {
            it('should remove from groups', () => {
                const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const expected = [{ "name": "groupB", "items": [] }];
                const actual = Groups.deleteGroup(groups, 0);
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input groups', () => {
                const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const actual = Groups.deleteGroup(groups, 0);
                expect(actual).not.toEqual(groups);
            });
            it('should delete second group', () => {
                const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const expected = [{ "name": "groupA", "items": [123] }];
                const actual = Groups.deleteGroup(groups, 1);
                expect(actual).toStrictEqual(expected);
            });
            it('should do nothing for negative index', () => {
                const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const expected = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const actual = Groups.deleteGroup(groups, -1);
                expect(actual).toStrictEqual(expected);
            });
            it('should do nothing for large index', () => {
                const groups = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const expected = [{ "name": "groupA", "items": [123] }, { "name": "groupB", "items": [] }];
                const actual = Groups.deleteGroup(groups, 11);
                expect(actual).toStrictEqual(expected);
            });
        });
    });
    describe('items', () => {
        describe('create', () => {
            it('should create one', () => {
                const groups = [{ "name": "groupA", "items": [] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                const actual = Groups.createItem(groups, 0, 'item1', 7, -3);
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input groups', () => {
                const groups = [{ "name": "groupA", "items": [] }];
                const actual = Groups.createItem(groups, 0, 'item1', 7, -3);
                expect(actual).not.toEqual(groups);
            });
            it('should append one', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }, { "name": "item2", "lat": 1, "lng": 4 }] }];
                const actual = Groups.createItem(groups, 0, 'item2', 1, 4);
                expect(actual).toStrictEqual(expected);
            });
            it('should not append one to missing group', () => {
                const groups = [];
                const expected = [];
                const actual = Groups.createItem(groups, 0, 'item2', 1, 4);
                expect(actual).toStrictEqual(expected);
            });
            it('should append one to correct group', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }, { "name": "groupB", "items": [] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }, { "name": "groupB", "items": [{ "name": "itemB1", "lat": 2, "lng": 4 }] }];
                const actual = Groups.createItem(groups, 1, 'itemB1', 2, 4);
                expect(actual).toStrictEqual(expected);
            });
        });
        describe('update', () => {
            describe('rename parts', () => {
                it('should update name', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1-EDITED", "lat": 7, "lng": -3 }] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1-EDITED', 7, -3);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input groups', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1-EDITED', 7, -3);
                    expect(actual).not.toEqual(groups);
                });
                it('should update lat and lng', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 5, "lng": 6 }] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1', 5, 6);
                    expect(actual).toStrictEqual(expected);
                });
                it('should update name, lat, and lng', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1-EDITED", "lat": 5, "lng": 6 }] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1-EDITED', 5, 6);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not update input groups', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1-EDITED', 5, 6);
                    expect(actual).not.toEqual(groups);
                });
                it('should not update if none exists', () => {
                    const groups = [{ "name": "groupA", "items": [] }];
                    const expected = [{ "name": "groupA", "items": [] }];
                    const actual = Groups.updateItem(groups, 0, 0, 'item1-EDITED', 1, 2);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not update name if group does not exist', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1", "lat": 7, "lng": -3 }] }];
                    const actual = Groups.updateItem(groups, 1, 0, 'item1-EDITED', 1, 2);
                    expect(actual).toStrictEqual(expected);
                });
            });
            describe('move', () => {
                it('should move up', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }];
                    const actual = Groups.moveItemUp(groups, 0, 1);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not move up if at top', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const actual = Groups.moveItemUp(groups, 0, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input groups', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const actual = Groups.moveItemUp(groups, 0, 1);
                    expect(actual).not.toEqual(groups);
                });
                it('should not move up if item index does not exist', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const actual = Groups.moveItemUp(groups, 0, 2);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not move up if group index does not exist', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const actual = Groups.moveItemUp(groups, 1, 1);
                    expect(actual).toStrictEqual(expected);
                });
                it('should move down', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }];
                    const actual = Groups.moveItemDown(groups, 0, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not move down if at bottom', () => {
                    const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                    const actual = Groups.moveItemDown(groups, 0, `2`);
                    expect(actual).toStrictEqual(expected);
                });
            });
        });
        describe('delete', () => {
            it('should when in middle', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item3" }] }];
                const actual = Groups.deleteItem(groups, 0, 1);
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input groups', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const actual = Groups.deleteItem(groups, 0, 1);
                expect(actual).not.toEqual(groups);
            });
            it('should when first', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item3" }] }];
                const actual = Groups.deleteItem(groups, 0, 0);
                expect(actual).toStrictEqual(expected);
            });
            it('should when last', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }] }];
                const actual = Groups.deleteItem(groups, 0, 2);
                expect(actual).toStrictEqual(expected);
            });
            it('should not do anything if item index is too large', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const actual = Groups.deleteItem(groups, 0, 4);
                expect(actual).toStrictEqual(expected);
            });
            it('should not do anything if group index is too large', () => {
                const groups = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const expected = [{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item2" }, { "name": "item3" }] }];
                const actual = Groups.deleteItem(groups, 8, 1);
                expect(actual).toStrictEqual(expected);
            });
            it('should from the correct group', () => {
                const groups = [{ "name": "groupA", "items": [{}] }, { "name": "groupB", "items": [{ "DELETE": "ME" }] }, { "name": "groupC", "items": [{}] }];
                const expected = [{ "name": "groupA", "items": [{}] }, { "name": "groupB", "items": [] }, { "name": "groupC", "items": [{}] }];
                const actual = Groups.deleteItem(groups, 1, 0);
                expect(actual).toStrictEqual(expected);
            });
        });
    });
});