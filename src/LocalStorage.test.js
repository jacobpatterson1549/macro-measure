import LocalStorage from './LocalStorage';

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
            storage.store['view'] = 'help';
            localStorage.setView('about');
            expect(storage.store).toStrictEqual({ 'view': 'about' });
        });
    });
});

describe('distance unit', () => {
    describe('get', () => {
        test('it should get', () => {
            storage.store['distanceUnit'] = 'm';
            expect(localStorage.getDistanceUnit()).toBe('m');
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store['distanceUnit'] = 'ft';
            localStorage.setDistanceUnit('ft');
            expect(storage.store).toStrictEqual({ 'distanceUnit': 'ft' });
        });
        test('it should from null', () => {
            localStorage.setDistanceUnit('yds');
            expect(storage.store).toStrictEqual({ 'distanceUnit': 'yds' });
        });
    });
});

describe('current group', () => {
    describe('get', () => {
        test('it should', () => {
            storage.store['currentGroup'] = 'abc';
            expect(localStorage.getCurrentGroup()).toBe('abc');
        });
        test('it should default to null', () => {
            expect(localStorage.getCurrentGroup()).toBeNull();
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store['currentGroup'] = 'def';
            localStorage.setCurrentGroup('ghi');
            expect(storage.store).toStrictEqual({ 'currentGroup': 'ghi' });
        });
    });
});

describe('current group item', () => {
    describe('get', () => {
        test('it should', () => {
            storage.store['currentGroupItem'] = 'abc';
            expect(localStorage.getCurrentGroupItem()).toBe('abc');
        });
        test('it should default to null', () => {
            expect(localStorage.getCurrentGroupItem()).toBeNull();
        });
    });
    describe('set', () => {
        test('it should', () => {
            storage.store['currentGroupItem'] = 'def';
            localStorage.setCurrentGroupItem('ghi');
            expect(storage.store).toStrictEqual({ 'currentGroupItem': 'ghi' });
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
        test('it will delete previous group of same name and add new to end', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":["will be overwritten"]},{}]' };
            localStorage.createGroup('groupA');
            expect(storage.store).toStrictEqual({ 'groups': '[{},{"name":"groupA","items":[]}]' });
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
                localStorage.updateGroup('groupA', 'groupA-EDITED');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA-EDITED","items":[123]},{"name":"groupB","items":[]}]' });
            });
            test('it should not update name of missing group', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
                localStorage.updateGroup('groupC', 'groupC-EDITED');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' });
            });
            test('it should return the groups when updated', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
                const groups = localStorage.updateGroup('groupB', 'groupB-EDITED');
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [123] }, { "name": "groupB-EDITED", "items": [] }]);
            });
        });
        describe("move", () => {
            test('it should move up', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp('groupB');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB"},{"name":"groupA"}]' });
            });
            test('it should not move up if at top', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp('groupA',);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
            test('it should return groups when moving one up', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                const groups = localStorage.moveGroupUp('groupB');
                expect(groups).toStrictEqual([{ "name": "groupB" }, { "name": "groupA" }]);
            });
            test('it should not move up if nonexistant', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupUp('groupC');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
            test('it should move down', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupDown('groupA');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB"},{"name":"groupA"}]' });
            });
            test('it should return groups when moving one down', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                const groups = localStorage.moveGroupDown('groupA');
                expect(groups).toStrictEqual([{ "name": "groupB" }, { "name": "groupA" }]);
            });
            test('it should not move down if at bottom', () => {
                storage.store = { 'groups': '[{"name":"groupA"},{"name":"groupB"}]' };
                localStorage.moveGroupDown('groupB');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA"},{"name":"groupB"}]' });
            });
        });
    });
    describe('delete', () => {
        test('it should', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup('groupA');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupB","items":[]}]' });
        });
        test('it should return groups after', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            const groups = localStorage.deleteGroup('groupA');
            expect(groups).toStrictEqual([{ "name": "groupB", "items": [] }]);
        });
        test('it should if nonexistant', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' };
            localStorage.deleteGroup('groupC');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[123]},{"name":"groupB","items":[]}]' });
        });
    });
});

describe('group items', () => {
    describe('create', () => {
        test('it should create one', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[]}]' };
            localStorage.createGroupItem('groupA', 'item1', 7, -3);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' });
        });
        test('it should append one', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
            localStorage.createGroupItem('groupA', 'item2', 1, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"},{"name":"item2","lat":"1","lng":"4"}]}]' });
        });
        test('it should not append one to missing group', () => {
            storage.store = { 'groups': '[]' };
            localStorage.createGroupItem('groupA', 'item2', 1, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[]' });
        });
        test('it should append one to correct group', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]},{"name":"groupB","items":[]}]' };
            localStorage.createGroupItem('groupB', 'itemB1', 2, 4);
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]},{"name":"groupB","items":[{"name":"itemB1","lat":"2","lng":"4"}]}]' });
        });
    });
    describe('get', () => {
        test('it should', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"},{"name":"item2","lat":"1","lng":"4"}]}]' };
            expect(localStorage.getGroupItems('groupA')).toStrictEqual([{ "name": "item1", "lat": "7", "lng": "-3" }, { "name": "item2", "lat": "1", "lng": "4" }]);
        });
        test('it should if none exist', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"},{"name":"item2","lat":"1","lng":"4"}]}]' };
            expect(localStorage.getGroupItems('groupB')).toStrictEqual([]);
        });
        test('it should if no group exists', () => {
            expect(localStorage.getGroupItems('groupC')).toStrictEqual([]);
        });
    });
    describe('update', () => {
        describe('rename parts', () => {
            test('it should update name', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
                localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED', 7, -3);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1-EDITED","lat":"7","lng":"-3"}]}]' });
            });
            test('it should update lat and lng', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
                localStorage.updateGroupItem('groupA', 'item1', 'item1', 5, 6);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"5","lng":"6"}]}]' });
            });
            test('it should update name, lat, and lng', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
                localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED', 5, 6);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1-EDITED","lat":"5","lng":"6"}]}]' });
            });
            test('it should return groups when updating name', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
                const groups = localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED', 7, -3);
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item1-EDITED", "lat": "7", "lng": "-3" }] }]);
            });
            test('it should not update if none exists', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[]}]' };
                localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED', 1, 2);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[]}]' });
            });
            test('it should not update name if group does not exist', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' };
                localStorage.updateGroupItem('groupB', 'item1', 'item1-EDITED', 1, 2);
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1","lat":"7","lng":"-3"}]}]' });
            });
        });
        describe('move', () => {
            test('it should move up', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemUp('groupA', 'item2');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item1"}]}]' });
            });
            test('it should not move up if at top', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemUp('groupA', 'item1');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should return groups when moving an item up', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                const groups = localStorage.moveGroupItemUp('groupA', 'item2');
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }]);
            });
            test('it should not move up if nonexistant', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemUp('groupA', 'item3');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should not move up if group nonexistant', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemUp('groupB', 'item2');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
            test('it should move down', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemDown('groupA', 'item1');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item1"}]}]' });
            });
            test('it should return groups when moving an item down', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                const groups = localStorage.moveGroupItemDown('groupA', 'item1');
                expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item2" }, { "name": "item1" }] }]);
            });
            test('it should not move down if at bottom', () => {
                storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' };
                localStorage.moveGroupItemDown('groupA', 'item2');
                expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
            });
        });
    });
    describe('delete', () => {
        test('it should when in middle', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteGroupItem('groupA', 'item2');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item3"}]}]' });
        });
        test('it should return groups when deleting an item', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            const groups = localStorage.deleteGroupItem('groupA', 'item2');
            expect(groups).toStrictEqual([{ "name": "groupA", "items": [{ "name": "item1" }, { "name": "item3" }] }]);
        });
        test('it should when first', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteGroupItem('groupA', 'item1');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item2"},{"name":"item3"}]}]' });
        });
        test('it should when last', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteGroupItem('groupA', 'item3');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"}]}]' });
        });
        test('it should not if nonexistant', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteGroupItem('groupA', 'item4');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' });
        });
        test('it should not if group nonexistant', () => {
            storage.store = { 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' };
            localStorage.deleteGroupItem('groupB', 'item2');
            expect(storage.store).toStrictEqual({ 'groups': '[{"name":"groupA","items":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}]' });
        });
    });
});