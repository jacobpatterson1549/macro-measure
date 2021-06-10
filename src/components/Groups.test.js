import { render, screen } from '@testing-library/react';

import { Groups } from './Groups';

import { View } from '../utils/View';

// These tests are very similar to these in Main.test.js - update them both
describe('Groups', () => {
  const MockApp = (props) => (
    <div>
      <button onClick={() => props.createGroupStart(...props.mockArgs)}>createGroupStart</button>
      <button onClick={() => props.createGroupEnd(...props.mockArgs)}>createGroupEnd</button>
      <button onClick={() => props.readGroup(...props.mockArgs)}>readGroup</button>
      <button onClick={() => props.readGroupList(...props.mockArgs)}>readGroupList</button>
      <button onClick={() => props.updateGroupStart(...props.mockArgs)}>updateGroupStart</button>
      <button onClick={() => props.updateGroupEnd(...props.mockArgs)}>updateGroupEnd</button>
      <button onClick={() => props.deleteGroupStart(...props.mockArgs)}>deleteGroupStart</button>
      <button onClick={() => props.deleteGroupEnd(...props.mockArgs)}>deleteGroupEnd</button>
      <button onClick={() => props.moveGroupUp(...props.mockArgs)}>moveGroupUp</button>
      <button onClick={() => props.moveGroupDown(...props.mockArgs)}>moveGroupDown</button>
      <button onClick={() => props.createItemStart(...props.mockArgs)}>createItemStart</button>
      <button onClick={() => props.createItemEnd(...props.mockArgs)}>createItemEnd</button>
      <button onClick={() => props.readItem(...props.mockArgs)}>readItem</button>
      <button onClick={() => props.readItemList(...props.mockArgs)}>readItemList</button>
      <button onClick={() => props.updateItemStart(...props.mockArgs)}>updateItemStart</button>
      <button onClick={() => props.updateItemEnd(...props.mockArgs)}>updateItemEnd</button>
      <button onClick={() => props.deleteItemStart(...props.mockArgs)}>deleteItemStart</button>
      <button onClick={() => props.deleteItemEnd(...props.mockArgs)}>deleteItemEnd</button>
      <button onClick={() => props.moveItemUp(...props.mockArgs)}>moveItemUp</button>
      <button onClick={() => props.moveItemDown(...props.mockArgs)}>moveItemDown</button>
    </div>
  );
  describe('group CRUD', () => {
    it('createGroupStart', () => {
      const props = {
        setView: jest.fn(),
      };
      const mockArgs = [];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'createGroupStart' }).click();
      expect(props.setView).toBeCalledWith(View.Group_Create);
    });
    it('createGroupEnd', () => {
      const expected = '[my custom group name]';
      const props = {
        groups: [],
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'createGroupEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
      expect(props.setGroups).toBeCalledWith([{ name: expected, items: [] }]);
    });
    it('readGroup', () => {
      const expected = 1;
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        setView: jest.fn(),
        setGroupIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'readGroup' }).click();
      expect(props.setView).toBeCalledWith(View.Item_List);
      expect(props.setGroupIndex).toBeCalledWith(expected);
    });
    it('readGroupList', () => {
      const props = {
        setView: jest.fn(),
      };
      const mockArgs = [];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'readGroupList' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
    });
    it('updateGroupStart', () => {
      const expected = 2;
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        setView: jest.fn(),
        setGroupIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'updateGroupStart' }).click();
      expect(props.setView).toBeCalledWith(View.Group_Update);
      expect(props.setGroupIndex).toBeCalledWith(expected);
    });
    it('updateGroupEnd', () => {
      const expected = '[groupC-EDITED]';
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        groupIndex: 2,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [2, expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'updateGroupEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupB' }, { name: expected }]);
    });
    it('deleteGroupStart', () => {
      const expected = 1;
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        setView: jest.fn(),
        setGroupIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'deleteGroupStart' }).click();
      expect(props.setView).toBeCalledWith(View.Group_Delete);
      expect(props.setGroupIndex).toBeCalledWith(expected);
    });
    it('deleteGroupEnd', () => {
      const expected = '1';
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        groupIndex: 1,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [2, expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'deleteGroupEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupB' }]);
    });
    it('moveGroupUp', () => {
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [2];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'moveGroupUp' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupC' }, { name: 'groupB' }]);
    });
    it('moveGroupDown', () => {
      const props = {
        groups: [{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }],
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [0];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'moveGroupDown' }).click();
      expect(props.setView).toBeCalledWith(View.Group_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'groupB' }, { name: 'groupA' }, { name: 'groupC' }]);
    });
  });
  describe('item CRUD', () => {
    it('createItemStart', () => {
      const props = {
        groups: [{ name: 'g', items: [] }],
        groupIndex: 0,
        setView: jest.fn(),
        setItemIndex: jest.fn(),
      };
      const mockArgs = [0];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'createItemStart' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Create);
      expect(props.setItemIndex).toBeCalledWith(0);
    });
    it('createItemEnd', () => {
      const expected = '[my custom item name]';
      const props = {
        groups: [{ name: 'g', items: [] }],
        groupIndex: 0,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [expected, 7, -9];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'createItemEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Read);
      expect(props.setGroups).toBeCalledWith([{ name: 'g', items: [{ name: expected, lat: 7, lng: -9 }] }]);
    });
    it('readItem', () => {
      const expected = 1;
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
        setItemIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'readItem' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Read);
      expect(props.setItemIndex).toBeCalledWith(expected);
    });
    it('readItemList', () => {
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
      };
      const mockArgs = [];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'readItemList' }).click();
      expect(props.setView).toBeCalledWith(View.Item_List);
    });
    it('updateItemStart', () => {
      const expected = 2;
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
        setItemIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'updateItemStart' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Update);
      expect(props.setItemIndex).toBeCalledWith(expected);
    });
    it('updateItemEnd', () => {
      const expected = '[iC-EDITED]';
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC', lat: 3, lng: 1 }] }],
        groupIndex: 0,
        itemIndex: 2,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [2, expected, 9, 0];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'updateItemEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Read);
      expect(props.setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: expected, lat: 9, lng: 0 }] }]);
    });
    it('deleteItemStart', () => {
      const expected = 2;
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
        setItemIndex: jest.fn(),
      };
      const mockArgs = [expected];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'deleteItemStart' }).click();
      expect(props.setView).toBeCalledWith(View.Item_Delete);
      expect(props.setItemIndex).toBeCalledWith(expected);
    });
    it('deleteItemEnd', () => {
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        itemIndex: 1,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [1];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'deleteItemEnd' }).click();
      expect(props.setView).toBeCalledWith(View.Item_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iC' }] }]);
    });
    it('moveItemUp', () => {
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [1];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'moveItemUp' }).click();
      expect(props.setView).toBeCalledWith(View.Item_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iB' }, { name: 'iA' }, { name: 'iC' }] }]);
    });
    it('moveItemDown', () => {
      const props = {
        groups: [{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }],
        groupIndex: 0,
        setView: jest.fn(),
        setGroups: jest.fn(),
      };
      const mockArgs = [1];
      render(<Groups {...props} render={groupUtils => (<MockApp {...groupUtils} mockArgs={mockArgs} />)} />);
      screen.getByRole('button', { name: 'moveItemDown' }).click();
      expect(props.setView).toBeCalledWith(View.Item_List);
      expect(props.setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iC' }, { name: 'iB' }] }]);
    });
  });
});