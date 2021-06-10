import { Crud } from './Crud';

describe('Items', () => {
    describe('items', () => {
        describe('create', () => {
            it('should return the items', () => {
                const items = [];
                const expected = [{ name: 'itemA' }];
                const actual = Crud.createItem(items, { name: 'itemA' });
                expect(actual).toStrictEqual(expected);
            });
            it('should not overwrite other item, but add to end', () => {
                const items = [{ name: 'itemA' }];
                const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                const actual = Crud.createItem(items, { name: 'itemB' });
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input items', () => {
                const items = [];
                const actual = Crud.createItem(items, { name: 'itemA' });
                expect(actual).not.toEqual(items);
            });
            it('should insert at proper order', () => {
                const items = [
                    { name: 'itemA_i', fk: 'a' },
                    { name: 'itemA_ii', fk: 'a' },
                    { name: 'itemB', fk: 'b' },
                ];
                const expected = [
                    { name: 'itemA_i', fk: 'a' },
                    { name: 'itemA_ii', fk: 'a' },
                    { name: 'itemA_iii', fk: 'a' },
                    { name: 'itemB', fk: 'b' },
                ];
                const actual = Crud.createItem(items, { name: 'itemA_iii', fk: 'a' }, (item) => (item.fk === 'a'));
                expect(actual).toStrictEqual(expected);
            });
        });
        describe('read', () => {
            const readTests = [
                [[], [], null],
                [[], [], () => false],
                [[], [{}], () => false],
                [[{}], [{}], () => true],
                [[{ 'a': 2 }], [{ 'a': 1 }, { 'a': 2 }], (item) => (item.a > 1)],
                [[{ 'a': 1 }, { 'a': 2 }], [{ 'a': 1 }, { 'a': 2 }], null],
                [[{ 'a': 1 }, { 'a': 2 }], [{ 'a': 1 }, { 'a': 2 }], (item) => (item.a > 0)],
            ];
            it.each(readTests)('should read %s when items are %s and filter is %s', (expected, items, filter) => {
                const actual = Crud.readItems(items, filter);
                expect(actual).toStrictEqual(expected);
            });
        });
        describe('update', () => {
            describe('rename', () => {
                it('should', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA-EDITED' }, { name: 'itemB' }];
                    const actual = Crud.updateItem(items, 0, { name: 'itemA-EDITED' });
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input items', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.updateItem(items, 0, { name: 'itemA-EDITED' });
                    expect(actual).not.toEqual(items);
                });
                it('should not update name of missing item', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.updateItem(items, 3, { name: 'itemC-EDITED' });
                    expect(actual).toStrictEqual(expected);
                });
                it('should return the items when updated', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA' }, { name: 'itemB-EDITED' }];
                    const actual = Crud.updateItem(items, 1, { name: 'itemB-EDITED' });
                    expect(actual).toStrictEqual(expected);
                });
            });
            describe('move', () => {
                it('should move up', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemB' }, { name: 'itemA' }];
                    const actual = Crud.moveItemUp(items, 1);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not move up if at top', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.moveItemUp(items, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input items (moveUp)', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.moveItemUp(items, 1);
                    expect(actual).not.toEqual(items);
                });
                it('should not move up if index too large', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.moveItemUp(items, 3);
                    expect(actual).toStrictEqual(expected);
                });
                it('should move down', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemB' }, { name: 'itemA' }];
                    const actual = Crud.moveItemDown(items, 0);
                    expect(actual).toStrictEqual(expected);
                });
                it('should not modify input items (moveDown)', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.moveItemDown(items, 0);
                    expect(actual).not.toEqual(items);
                });
                it('should not move down if at bottom', () => {
                    const items = [{ name: 'itemA' }, { name: 'itemB' }];
                    const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                    const actual = Crud.moveItemDown(items, 1);
                    expect(actual).toStrictEqual(expected);
                });
            });
        });
        describe('delete', () => {
            it('should remove from items', () => {
                const items = [{ name: 'itemA' }, { name: 'itemB' }];
                const expected = [{ name: 'itemB' }];
                const actual = Crud.deleteItem(items, 0);
                expect(actual).toStrictEqual(expected);
            });
            it('should not modify input items', () => {
                const items = [{ name: 'itemA' }, { name: 'itemB' }];
                const actual = Crud.deleteItem(items, 0);
                expect(actual).not.toEqual(items);
            });
            it('should delete second item', () => {
                const items = [{ name: 'itemA' }, { name: 'itemB' }];
                const expected = [{ name: 'itemA' }];
                const actual = Crud.deleteItem(items, 1);
                expect(actual).toStrictEqual(expected);
            });
            it('should do nothing for negative index', () => {
                const items = [{ name: 'itemA' }, { name: 'itemB' }];
                const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                const actual = Crud.deleteItem(items, -1);
                expect(actual).toStrictEqual(expected);
            });
            it('should do nothing for large index', () => {
                const items = [{ name: 'itemA', }, { name: 'itemB' }];
                const expected = [{ name: 'itemA' }, { name: 'itemB' }];
                const actual = Crud.deleteItem(items, 11);
                expect(actual).toStrictEqual(expected);
            });
            it('should remove all items that match filter', () => {
                const items = [
                    { name: 'itemA', fk: 1 },
                    { name: 'itemB', fk: 2 },
                    { name: 'itemC', fk: 2 },
                    { name: 'itemD', fk: 3 },
                    { name: 'itemE', fk: 4 },
                    { name: 'itemF', fk: 1 },
                    { name: 'itemG', fk: 2 },
                ];
                const expected = [
                    { name: 'itemA', fk: 1 },
                    { name: 'itemD', fk: 3 },
                    { name: 'itemE', fk: 4 },
                    { name: 'itemF', fk: 1 },
                ];
                const actual = Crud.deleteItems(items, (item) => (item.fk === 2)); // Note that all items that match the filter are deleted
                expect(actual).toStrictEqual(expected);
            });
        });
    });
});