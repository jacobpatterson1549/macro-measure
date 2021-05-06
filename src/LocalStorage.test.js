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
    test('it should get', () => {
        storage.store['distanceUnit'] = 'settings';
        expect(localStorage.getDistanceUnit()).toBe('settings');
    });
    test('it should set', () => {
        storage.store['view'] = 'help';
        localStorage.setView('about');
        expect(storage.store).toStrictEqual({ 'view': 'about' });
    });
});

describe('distance unit', () => {
    test('it should get', () => {
        storage.store['distanceUnit'] = 'm';
        expect(localStorage.getDistanceUnit()).toBe('m');
    });
    test('it should set', () => {
        storage.store['distanceUnit'] = 'ft';
        localStorage.setDistanceUnit('ft');
        expect(storage.store).toStrictEqual({ 'distanceUnit': 'ft' });
    });
    test('it should set from null', () => {
        localStorage.setDistanceUnit('yds');
        expect(storage.store).toStrictEqual({ 'distanceUnit': 'yds' });
    });
});

describe('current group', () => {
    test('it should get', () => {
        storage.store['currentGroup'] = 'abc';
        expect(localStorage.getCurrentGroup()).toBe('abc');
    });
    test('it should default to null', () => {
        expect(localStorage.getCurrentGroup()).toBeNull();
    });
    test('it should set', () => {
        storage.store['currentGroup'] = 'def';
        localStorage.setCurrentGroup('ghi');
        expect(storage.store).toStrictEqual({ 'currentGroup': 'ghi' });
    });
});

describe('current group item', () => {
    test('it should get', () => {
        storage.store['currentGroupItem'] = 'abc';
        expect(localStorage.getCurrentGroupItem()).toBe('abc');
    });
    test('it should default to null', () => {
        expect(localStorage.getCurrentGroupItem()).toBeNull();
    });
    test('it should set', () => {
        storage.store['currentGroupItem'] = 'def';
        localStorage.setCurrentGroupItem('ghi');
        expect(storage.store).toStrictEqual({ 'currentGroupItem': 'ghi' });
    });
});

describe('groups', () => {
    test('it should create', () => {
        localStorage.createGroup('groupA');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[]}' });
    });
    test('it will overwrite previous group of same name', () => {
        storage.store = { 'groups': '{"groupA":["will be overwritten"]}' };
        localStorage.createGroup('groupA');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[]}' });
    });
    test('it should not overwrite other group', () => {
        storage.store = { 'groups': '{"groupA":[true]}' };
        localStorage.createGroup('groupB');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[true],"groupB":[]}' });
    });
    test('it should get all', () => {
        storage.store = { 'groups': '{"groupA":[],"groupB":[456]}' };
        expect(localStorage.getGroups()).toStrictEqual({ 'groupA': [], 'groupB': [456] });
    });
    test('it should get all if no group eists', () => {
        expect(localStorage.getGroups()).toStrictEqual({});
    });
    test('it should update name', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        localStorage.updateGroup('groupA', 'groupA-EDITED');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupB":[],"groupA-EDITED":[123]}' });
    });
    test('it should update name', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        localStorage.updateGroup('groupC', 'groupC-EDITED');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[123],"groupB":[]}' });
    });
    test('it should return the groups when updated', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        const groups = localStorage.updateGroup('groupB', 'groupB-EDITED');
        expect(groups).toStrictEqual({ "groupA": [123], "groupB-EDITED": [] });
    });
    test('it should delete', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        localStorage.deleteGroup('groupA');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupB":[]}' });
    });
    test('it should return groups after delete', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        const groups = localStorage.deleteGroup('groupA');
        expect(groups).toStrictEqual({"groupB":[]});
    });
    test('it should delete if nonexistant', () => {
        storage.store = { 'groups': '{"groupA":[123],"groupB":[]}' };
        localStorage.deleteGroup('groupC');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[123],"groupB":[]}' });
    });
});

describe('group items', () => {
    test('it should create one', () => {
        storage.store = { 'groups': '{"groupA":[]}' };
        localStorage.createGroupItem('groupA', 'item1', 7, -3);
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}]}' });
    });
    test('it should append one', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}]}' };
        localStorage.createGroupItem('groupA', 'item2', 1, 4);
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"},{"name":"item2","lat":"1","lon":"4"}]}' });
    });
    test('it should not append one to missing group', () => {
        storage.store = { 'groups': '{}' };
        localStorage.createGroupItem('groupA', 'item2', 1, 4);
        expect(storage.store).toStrictEqual({ 'groups': '{}' });
    });
    test('it should append one to correct group', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}],"groupB":[]}' };
        localStorage.createGroupItem('groupB', 'itemB1', 2, 4);
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}],"groupB":[{"name":"itemB1","lat":"2","lon":"4"}]}' });
    });
    test('it should get all', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"},{"name":"item2","lat":"1","lon":"4"}]}' };
        expect(localStorage.getGroupItems('groupA')).toStrictEqual([{ "name": "item1", "lat": "7", "lon": "-3" }, { "name": "item2", "lat": "1", "lon": "4" }]);
    });
    test('it should get all if none exist', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"},{"name":"item2","lat":"1","lon":"4"}]}' };
        expect(localStorage.getGroupItems('groupB')).toStrictEqual([]);
    });
    test('it should get all if no group exists', () => {
        expect(localStorage.getGroupItems('groupC')).toStrictEqual([]);
    });
    test('it should update name', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}]}' };
        localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1-EDITED","lat":"7","lon":"-3"}]}' });
    });
    test('it should return groups when updating name', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1","lat":"7","lon":"-3"}]}' };
        const groups = localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED');
        expect(groups).toStrictEqual({"groupA":[{"name":"item1-EDITED","lat":"7","lon":"-3"}]});
    });
    test('it should not update name if none exists', () => {
        storage.store = { 'groups': '{"groupA":[]}' };
        localStorage.updateGroupItem('groupA', 'item1', 'item1-EDITED');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[]}' });
    });
    test('it should move up', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        localStorage.moveGroupItemUp('groupA', 'item2');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item2"},{"name":"item1"}]}' });
    });
    test('it should not move up if at top', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        localStorage.moveGroupItemUp('groupA', 'item1');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' });
    });
    test('it should return groups when moving an item up', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        const groups = localStorage.moveGroupItemUp('groupA', 'item2');
        expect(groups).toStrictEqual({"groupA":[{"name":"item2"},{"name":"item1"}]});
    });
    test('it should not move up if nonexistant', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        localStorage.moveGroupItemUp('groupA', 'item3');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' });
    });
    test('it should move down', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        localStorage.moveGroupItemDown('groupA', 'item1');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item2"},{"name":"item1"}]}' });
    });
    test('it should return groups when moving an item down down', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        const groups = localStorage.moveGroupItemDown('groupA', 'item1');
        expect(groups).toStrictEqual({"groupA":[{"name":"item2"},{"name":"item1"}]});
    });
    test('it should not move down if at bottom', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' };
        localStorage.moveGroupItemDown('groupA', 'item2');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' });
    });
    test('it should delete if when in middle', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' };
        localStorage.deleteGroupItem('groupA', 'item2');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item3"}]}' });
    });
    test('it should return groups when deleting an item', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' };
        const groups = localStorage.deleteGroupItem('groupA', 'item2');
        expect(groups).toStrictEqual({"groupA":[{"name":"item1"},{"name":"item3"}]});
    });
    test('it should delete when first', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' };
        localStorage.deleteGroupItem('groupA', 'item1');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item2"},{"name":"item3"}]}' });
    });
    test('it should delete when last', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' };
        localStorage.deleteGroupItem('groupA', 'item3');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"}]}' });
    });
    test('it should not delete if nonexistant', () => {
        storage.store = { 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' };
        localStorage.deleteGroupItem('groupA', 'item4');
        expect(storage.store).toStrictEqual({ 'groups': '{"groupA":[{"name":"item1"},{"name":"item2"},{"name":"item3"}]}' });
    });
})