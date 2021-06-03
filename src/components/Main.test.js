import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Main } from './Main';

import { View } from '../utils/View';

describe('Main', () => {
  describe('views', () => {
    const views = Object.values(View).filter(Number.isInteger);
    it.each(views)('should render with view id=%s', (view) => {
      render(
        <Main
          view={view}
          setGPSOn={jest.fn()}
        />
      );
    });
    it('should render default view if view is unknown (or outdated)', () => {
      render(<Main view={'settings'} />);
      expect(screen.queryByText(/settings/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/create group/i)).toBeInTheDocument();
    });
  });
  // These tests (group/item CRUD) are very similar to these in Groups.test.js - update them both
  describe('group CRUD', () => {
    it('should start to create a group', () => {
      const createGroupStart = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        createGroupStart={createGroupStart}
        groups={[]}
      />);
      screen.getByRole('button', { name: /create group/i }).click();
      expect(createGroupStart).toBeCalled();
    });
    it('should create a group', () => {
      const createGroupEnd = jest.fn();
      const expected = '[my custom group name]';
      render(<Main
        view={View.Group_Create}
        groups={[]}
        createGroupEnd={createGroupEnd}
      />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: expected } });
      screen.getByRole('button', { name: /create group/i }).click();
      expect(createGroupEnd).toBeCalledWith(expected);
    });
    it('should read a group', () => {
      const readGroup = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        readGroup={readGroup}
      />);
      screen.getByText('groupB').click();
      expect(readGroup).toBeCalled();
    });
    it.each([View.Group_Create, View.Group_Update, View.Group_Delete])('should read groups when %s is cancelled', (view) => {
      const readGroupList = jest.fn();
      render(<Main
        view={view}
        groups={[]}
        readGroupList={readGroupList}
      />);
      screen.getByText(/cancel/i).click();
      expect(readGroupList).toBeCalled();
    });
    it('should start to update a group', () => {
      const updateGroupStart = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        updateGroupStart={updateGroupStart}
      />);
      screen.getAllByRole('button', { name: /update/i })[2].click();
      expect(updateGroupStart).toBeCalledWith(2);
    });
    it('should update a group', () => {
      const updateGroupEnd = jest.fn();
      const expected = '[groupC-EDITED]'
      render(<Main
        view={View.Group_Update}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        groupIndex={2}
        updateGroupEnd={updateGroupEnd}
      />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: expected } });
      screen.getByRole('button', { name: /update group/i }).click();
      expect(updateGroupEnd).toBeCalledWith(2, expected);
    });
    it('should start to delete a group', () => {
      const deleteGroupStart = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        deleteGroupStart={deleteGroupStart}
      />);
      screen.getAllByRole('button', { name: /delete/i })[1].click();
      expect(deleteGroupStart).toBeCalledWith(1);
    });
    it('should delete a group', () => {
      const deleteGroupEnd = jest.fn();
      render(<Main
        view={View.Group_Delete}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        groupIndex={1}
        deleteGroupEnd={deleteGroupEnd}
      />);
      screen.getByRole('button', { name: /delete group/i }).click();
      expect(deleteGroupEnd).toBeCalledWith(1);
    });
    it('should move a group up', () => {
      const moveGroupUp = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        moveGroupUp={moveGroupUp}
      />);
      screen.getAllByRole('button', { name: /move up/i })[1].click(); // first group cannot be moved up
      expect(moveGroupUp).toBeCalledWith(2);
    });
    it('should move a group down', () => {
      const moveGroupDown = jest.fn();
      render(<Main
        view={View.Group_Read_List}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        moveGroupDown={moveGroupDown}
      />);
      screen.getAllByRole('button', { name: /move down/i })[0].click();
      expect(moveGroupDown).toBeCalledWith(0);
    });
  });
  describe('item CRUD', () => {
    it('should start to create an item from list', () => {
      const createItemStart = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [] }]}
        groupIndex={0}
        createItemStart={createItemStart}
      />);
      screen.getByRole('button', { name: /create item/i }).click();
      expect(createItemStart).toBeCalled();
    });
    it('should start to create an item', () => {
      const createItemStart = jest.fn();
      render(<Main
        view={View.Item_Read}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={1}
        createItemStart={createItemStart}
        setGPSOn={jest.fn()}
      />);
      screen.getByRole('button', { name: /create item/i }).click();
      expect(createItemStart).toBeCalled();
    });
    it('should create an item', async () => {
      const createItemEnd = jest.fn();
      const expected = '[my custom item name]';
      render(<Main
        view={View.Item_Create}
        groups={[{ name: 'g', items: [] }]}
        groupIndex={0}
        createItemEnd={createItemEnd}
        setGPSOn={jest.fn()}
      />);
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
      const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
      await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } })); // must have location to create item
      screen.getByRole('button', { name: /create item/i }).click();
      expect(createItemEnd).toBeCalledWith(expected, 7, -9);
    });
    it('should read an item', () => {
      const readItem = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        readItem={readItem}
        setGPSOn={jest.fn()}
        />);
      screen.getByText('iB').click();
      expect(readItem).toBeCalledWith(1);
    });
    const itemArrowReadTests = [
      ['previous item', 0],
      ['next item', 2],
    ];
    it.each(itemArrowReadTests)('should read the %s', (buttonName, expected) => {
      const readItem = jest.fn();
      render(<Main
        view={View.Item_Read}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={1}
        readItem={readItem}
        setGPSOn={jest.fn()}
      />);
      screen.getByRole('button', { name: buttonName }).click();
      expect(readItem).toBeCalledWith(expected);
    });
    it('should read items when item create is cancelled', async () => {
      const readItemList = jest.fn();
      render(<Main
        view={View.Item_Create}
        groups={[]}
        groupIndex={0}
        readItemList={readItemList}
        setGPSOn={jest.fn()}
      />);
      screen.getByText(/cancel/i).click();
      expect(readItemList).toBeCalledWith();
    });
    const itemCancelTests = [
      View.Item_Update,
      View.Item_Delete,
    ]
    it.each(itemCancelTests)('should read items when %s is cancelled', (view) => {
      const readItem = jest.fn();
      render(<Main
        view={view}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={0}
        readItem={readItem}
        setGPSOn={jest.fn()}
        />);
      screen.getByText(/cancel/i).click();
      expect(readItem).toBeCalled();
    });
    it('should start to update an item from list', () => {
      const updateItemStart = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        updateItemStart={updateItemStart}
      />);
      screen.getAllByRole('button', { name: /update value/i })[2].click();
      expect(updateItemStart).toBeCalledWith(2);
    });
    it('should start to update an item', () => {
      const updateItemStart = jest.fn();
      render(<Main
        view={View.Item_Read}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={2}
        updateItemStart={updateItemStart}
        setGPSOn={jest.fn()}
      />);
      screen.getByRole('button', { name: /update item/i }).click();
      expect(updateItemStart).toBeCalledWith(2);
    });
    it('should update an item', () => {
      const updateItemEnd = jest.fn();
      const expected = '[iC-EDITED]'
      render(<Main
        view={View.Item_Update}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC', lat: 3, lng: 1 }] }]}
        groupIndex={0}
        itemIndex={2}
        updateItemEnd={updateItemEnd}
        setGPSOn={jest.fn()}
        />);
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
      screen.getByRole('button', { name: /update item/i }).click();
      expect(updateItemEnd).toBeCalledWith(2, expected, 3, 1);
    });
    it('should start to delete an item from list', () => {
      const deleteItemStart = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        deleteItemStart={deleteItemStart}
        setGPSOn={jest.fn()}
        />);
      screen.getAllByRole('button', { name: /delete value/i })[1].click();
      expect(deleteItemStart).toBeCalledWith(1);
    });
    it('should start to delete an item', () => {
      const deleteItemStart = jest.fn();
      render(<Main
        view={View.Item_Read}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={1}
        deleteItemStart={deleteItemStart}
        setGPSOn={jest.fn()}
      />);
      screen.getByRole('button', { name: /delete/i }).click();
      expect(deleteItemStart).toBeCalledWith(1);
    });
    it('should delete an item', () => {
      const deleteItemEnd = jest.fn();
      render(<Main
        view={View.Item_Delete}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={1}
        deleteItemEnd={deleteItemEnd}
        setGPSOn={jest.fn()}
        />);
      screen.getByRole('button', { name: /delete item/i }).click();
      expect(deleteItemEnd).toBeCalledWith(1);
    });
    it('should move an item up', () => {
      const moveItemUp = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        moveItemUp={moveItemUp}
      />);
      screen.getAllByRole('button', { name: /move up/i })[0].click(); // first item cannot be moved up
      expect(moveItemUp).toBeCalledWith(1);
    });
    it('should move an item down', () => {
      const moveItemDown = jest.fn();
      render(<Main
        view={View.Item_Read_List}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        moveItemDown={moveItemDown}
      />);
      screen.getAllByRole('button', { name: /move down/i })[1].click();
      expect(moveItemDown).toBeCalledWith(1);
    });
  });
  describe('settings toggling', () => {
    it('should setHighAccuracyGPS', () => {
      render(<Main
        view={View.Settings}
      />);
      const element = screen.getByRole('checkbox', { name: /GPS/ });
      element.click(); // will crash if state props are not correctly appended to inherited props
      expect(element.checked).toBe(true);
    });
  });
});