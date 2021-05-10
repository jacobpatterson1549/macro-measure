import { LocalStorage } from './LocalStorage';

class LocalStorageMock {

    constructor() {
        this.store = {};
    }

    getItem(name) {
        return this.store[name];
    }

    setItem(name, value) {
        this.store[name] = String(value);
    }

    clear() {
        this.store = {};
    }
}

let storage, localStorage;

beforeEach(() => {
    storage = new LocalStorageMock();
    localStorage = new LocalStorage(storage);
});

describe('clear', () => {
    test('it should', () => {
        storage.store = { 'junk': 'is', 'here': [123] };
        localStorage.clear();
        expect(storage.store).toStrictEqual({});
    });
    test('it should if already empty', () => {
        localStorage.clear();
        expect(storage.store).toStrictEqual({});
    });
});

describe('view', () => {
    describe('get', () => {
        test('it should', () => {
            storage.store['distanceUnit'] = 'settings';
            expect(localStorage.getDistanceUnit()).toBe('settings');
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store = { 'view': 'help' };
            localStorage.setView('about');
            expect(storage.store).toStrictEqual({ 'view': 'about' });
        });
    });
});

describe('distance unit', () => {
    describe('get', () => {
        test('it should get', () => {
            storage.store = { 'distanceUnit': 'm' };
            expect(localStorage.getDistanceUnit()).toBe('m');
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store = { 'distanceUnit': 'ft' };
            localStorage.setDistanceUnit('ft');
            expect(storage.store).toStrictEqual({ 'distanceUnit': 'ft' });
        });
        test('it should from null', () => {
            localStorage.setDistanceUnit('yds');
            expect(storage.store).toStrictEqual({ 'distanceUnit': 'yds' });
        });
    });
});

describe('current group index', () => {
    describe('get', () => {
        test('it should', () => {
            storage.store = { 'currentGroupIndex': 8 }
            expect(localStorage.getCurrentGroupIndex()).toBe(8);
        });
        test('it should default to zero', () => {
            expect(localStorage.getCurrentGroupIndex()).toBe(-1);
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store = { 'currentGroupIndex': 3 };
            localStorage.setCurrentGroupIndex(4);
            expect(storage.store).toStrictEqual({ 'currentGroupIndex': '4' });
        });
    });
});

describe('current item index', () => {
    describe('get', () => {
        test('it should', () => {
            storage.store = { 'currentItemIndex': 48 };
            expect(localStorage.getCurrentItemIndex()).toBe(48);
        });
        test('it should default to zero', () => {
            expect(localStorage.getCurrentItemIndex()).toBe(-1);
        });
    });
    describe('set', () => {
        test('it should', () => {
            localStorage.setCurrentItemIndex(35);
            expect(storage.store).toStrictEqual({ 'currentItemIndex': '35' });
        });
    });
});

describe('groups', () => {
    describe('create', () => {
        test('it should', () => {
            localStorage.createGroup('groupA');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[]}]' });
        });
        test('it should return the groups', () => {
            const groups = localStorage.createGroup('groupA');
            expect(groups).toStrictEqual([{ "name": "groupA", "items": [] }]);
        });
        test('it will create a group with a duplicate name without checking for duplicates', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":["will not be overwritten"]},{}]' };
            localStorage.createGroup('groupA');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":["will not be overwritten"]},{},{"name":"groupA","items":[]}]' });
        });
        test('it should not overwrite other group, but add to end', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[true]}]' };
            localStorage.createGroup('groupB');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[true]},{"name":"groupB","items":[]}]' });
        });
    });
    describe('get', () => {
        test('it should', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[]},{"name":"groupB","items":[456]}]' };
            expect(localStorage.getGroups()).toStrictEqual([{ name: 'groupA', items: [] }, { name: 'groupB', items: [456] }]);
        });
        test('it should if not exist', () => {
            expect(localStorage.getGroups()).toStrictEqual([]);
        });
    });
    describe('update', () => {
        describe('rename', () => {
            test('it should', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
                localStorage.updateGroup(0, 'groupA-EDITED');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA-EDITED","items":[123]},{"name":"groupB","items":[]}]' });
            });
            test('it should not update name of missing group', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
                localStorage.updateGroup(3, 'groupC-EDITED');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' });
            });
            test('it should return the groups when updated', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
                const groups = localStorage.updateGroup(1, 'groupB-EDITED');
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [123] }, { "name": "groupB-EDITED", "items": [] }]);
            });
        });
        describe("move", () => {
            test('it should move up', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp(1);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB"},{"name":"groupA"}]' });
            });
            test('it should not move up if at top', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp(0);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
            test('it should return groups when moving one up', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                const groups = localStorage.moveGroupUp(1);
                expect(groups).toStrictEqual([{ "name": "groupB" }, { "name": "groupA" }]);
            });
            test('it should not move up if index too large', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp(3);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
            test('it should move down', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupDown(0);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB"},{"name":"groupA"}]' });
            });
            test('it should return groups when moving one down', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                const groups = localStorage.moveGroupDown(0);
                expect(groups).toStrictEqual([{ "name": "groupB" }, { "name": "groupA" }]);
            });
            test('it should not move down if at bottom', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupDown(1);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
        });
    });
    describe('delete', () => {
        test('it should', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup(0);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB","items":[]}]' });
        });
        test('it should return groups after', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            const groups = localStorage.deleteGroup(0);
            expect(groups).toStrictEqual([{ "name": "groupB", "items": [] }]);
        });
        test('it should delete second group', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup(1);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]}]' });
        });
        test('it should do nothing for negative index', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup(-1);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' });
        });
        test('it should do nothing for large index', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup(11);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' });
        });
    });
});

describe('group items', () => {
    describe('create', () => {
        test('it should create one', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[]}]' };
            localStorage.createItem(0, 'item1', 7, -3);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' });
        });
        test('it should append one', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
            localStorage.createItem(0, 'item2', 1, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3},{"name":"item2","lat":1,"lng":4}]}]' });
        });
        test('it should not append one to missing group', () => {
            storage.store = { 'groups': '[]' };
            localStorage.createItem(0, 'item2', 1, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[]' });
        });
        test('it should append one to correct group', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]},{"name":"groupB","items":[]}]' };
            localStorage.createItem(1, 'itemB1', 2, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]},{"name":"groupB","items":[{"name":"itemB1","lat":2,"lng":4}]}]' });
        });
    });
    describe('update', () => {
        describe('rename parts', () => {
            test('it should update name', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
                localStorage.updateItem(0, 0, 'item1-EDITED', 7, -3);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1-EDITED","lat":7,"lng":-3}]}]' });
            });
            test('it should update lat and lng', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
                localStorage.updateItem(0, 0, 'item1', 5, 6);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":5,"lng":6}]}]' });
            });
            test('it should update name, lat, and lng', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
                localStorage.updateItem(0, 0, 'item1-EDITED', 5, 6);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1-EDITED","lat":5,"lng":6}]}]' });
            });
            test('it should return groups when updating name', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
                const groups = localStorage.updateItem(0, 0, 'item1-EDITED', 7, -3);
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item1-EDITED", "lat": 7, "lng": -3 }] }]);
            });
            test('it should not update if none exists', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[]}]' };
                localStorage.updateItem(0, 0, 'item1-EDITED', 1, 2);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[]}]' });
            });
            test('it should not update name if group does not exist', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' };
                localStorage.updateItem(1, 0, 'item1-EDITED', 1, 2);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":7,"lng":-3}]}]' });
            });
        });
        describe('move', () => {
            test('it should move up', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemUp(0, 1);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item1"}]}]' });
            });
            test('it should not move up if at top', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemUp(0, 0);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should return groups when moving an item up', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                const groups = localStorage.moveItemUp(0, 1);
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }]);
            });
            test('it should not move up if item index does not exist', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemUp(0, 2);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should not move up if group index does not exist', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemUp(1, 1);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should move down', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemDown(0, 0);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item1"}]}]' });
            });
            test('it should return groups when moving an item down', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                const groups = localStorage.moveItemDown(0, 0);
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }]);
            });
            test('it should not move down if at bottom', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveItemDown(0, 1);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
        });
    });
    describe('delete', () => {
        test('it should when in middle', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteItem(0, 1);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item3"}]}]' });
        });
        test('it should return groups when deleting an item', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            const groups = localStorage.deleteItem(0, 1);
            expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item3" }] }]);
        });
        test('it should when first', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteItem(0, 0);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item3"}]}]' });
        });
        test('it should when last', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteItem(0, 2);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
        });
        test('it should not do anything if item index is too large', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteItem(0, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' });
        });
        test('it should not do anything if group index is too large', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteItem(8, 1);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' });
        });
        test('it should from the correct group', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{}]},{"name":"groupB","items":[{"DELETE":"ME"}]},{"name":"groupC","items":[{}]}]' };
            localStorage.deleteItem(1, 0);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{}]},{"name":"groupB","items":[]},{"name":"groupC","items":[{}]}]' });
        });
    });
});