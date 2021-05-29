import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Main } from './Main';

import { View } from '../utils/View';

describe('Main', () => {
  describe('group CRUD', () => {
    it('should start to create a group', () => {
      const setView = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[]}
      />);
      screen.getByRole('button', { name: /create group/i }).click();
      expect(setView).toBeCalledWith(View.Group_Create);
    });
    it('should create a group', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      const expected = '[my custom group name]';
      render(<Main
        view={View.Group_Create}
        setView={setView}
        groups={[]}
        setGroups={setGroups}
      />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: expected } });
      screen.getByRole('button', { name: /create group/i }).click();
      expect(setView).toBeCalledWith(View.Groups_Read);
      expect(setGroups).toBeCalledWith([{ name: expected, items: [] }]);
    });
    it('should read a group', () => {
      const setView = jest.fn();
      const setGroupIndex = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroupIndex={setGroupIndex}
      />);
      screen.getByText('groupB').click();
      expect(setView).toBeCalledWith(View.Items_Read);
      expect(setGroupIndex).toBeCalledWith(1);
    });
    it.each([View.Group_Create, View.Group_Update, View.Group_Delete])('should read groups when %s is cancelled', (view) => {
      const setView = jest.fn();
      render(<Main
        view={view}
        setView={setView}
        groups={[]}
      />);
      screen.getByText(/cancel/i).click();
      expect(setView).toBeCalledWith(View.Groups_Read);
    });
    it('should start to update a group', () => {
      const setView = jest.fn();
      const setGroupIndex = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroupIndex={setGroupIndex}
      />);
      screen.getAllByRole('button', { name: /update/i })[2].click();
      expect(setView).toBeCalledWith(View.Group_Update);
      expect(setGroupIndex).toBeCalledWith(2);
    });
    it('should update a group', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      const expected = '[groupC-EDITED]'
      render(<Main
        view={View.Group_Update}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroups={setGroups}
        groupIndex={2}
      />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: expected } });
      screen.getByRole('button', { name: /update group/i }).click();
      expect(setView).toBeCalledWith(View.Groups_Read);
      expect(setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupB' }, { name: expected }]);
    });
    it('should start to delete a group', () => {
      const setView = jest.fn();
      const setGroupIndex = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroupIndex={setGroupIndex}
      />);
      screen.getAllByRole('button', { name: /delete/i })[1].click();
      expect(setView).toBeCalledWith(View.Group_Delete);
      expect(setGroupIndex).toBeCalledWith(1);
    });
    it('should delete a group', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Group_Delete}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroups={setGroups}
        groupIndex={1}
      />);
      screen.getByRole('button', { name: /delete group/i }).click();
      expect(setView).toBeCalledWith(View.Groups_Read);
      expect(setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupC' }]);
    });
    it('should move a group up', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroups={setGroups}
      />);
      screen.getAllByRole('button', { name: /move up/i })[1].click(); // first group cannot be moved up
      expect(setView).toBeCalledWith(View.Groups_Read);
      expect(setGroups).toBeCalledWith([{ name: 'groupA' }, { name: 'groupC' }, { name: 'groupB' }]);
    });
    it('should move a group down', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Groups_Read}
        setView={setView}
        groups={[{ name: 'groupA' }, { name: 'groupB' }, { name: 'groupC' }]}
        setGroups={setGroups}
      />);
      screen.getAllByRole('button', { name: /move down/i })[0].click();
      expect(setView).toBeCalledWith(View.Groups_Read);
      expect(setGroups).toBeCalledWith([{ name: 'groupB' }, { name: 'groupA' }, { name: 'groupC' }]);
    });
  });
  describe('item CRUD', () => {
    const mockGeolocation = async (lat, lng) => {
      const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
      await waitFor(() => successCallback({ coords: { latitude: lat, longitude: lng, } }));
    };
    it('should start to create an item', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [] }]}
        groupIndex={0}
        setItemIndex={setItemIndex}
      />);
      screen.getByRole('button', { name: /create item/i }).click();
      expect(setView).toBeCalledWith(View.Item_Create);
      expect(setItemIndex).toBeCalledWith(0);
    });
    it('should create an item', async () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      const expected = '[my custom item name]';
      render(<Main
        view={View.Item_Create}
        setView={setView}
        groups={[{ name: 'g', items: [] }]}
        groupIndex={0}
        setGroups={setGroups}
      />);
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
      await mockGeolocation(7, -9); // enable the submit button
      screen.getByRole('button', { name: /create item/i }).click();
      expect(setView).toBeCalledWith(View.Item_Read);
      expect(setGroups).toBeCalledWith([{ name: 'g', items: [{ name: expected, lat: 7, lng: -9 }] }]);
    });
    it('should read an item', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        setItemIndex={setItemIndex}
      />);
      screen.getByText('iB').click();
      expect(setView).toBeCalledWith(View.Item_Read);
      expect(setItemIndex).toBeCalledWith(1);
    });
    const itemArrowReadTests = [
      ['previous item', 0],
      ['next item', 2],
    ];
    it.each(itemArrowReadTests)('should read the %s', (buttonName, expected) => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Item_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={1}
        setItemIndex={setItemIndex}
      />);
      screen.getByRole('button', { name: buttonName }).click();
      expect(setView).toBeCalledWith(View.Item_Read);
      expect(setItemIndex).toBeCalledWith(expected);
    });
    it('should read items when item create is cancelled', async () => {
      const setView = jest.fn();
      render(<Main
        view={View.Item_Create}
        setView={setView}
        groups={[]}
        groupIndex={0}
      />);
      await mockGeolocation(); // TODO: cancel should never be disabled for item create, combine with tests below
      screen.getByText(/cancel/i).click();
      expect(setView).toBeCalledWith(View.Items_Read);
    });
    const itemCancelTests = [
      [View.Item_Read, View.Item_Update, false],
      [View.Item_Read, View.Item_Delete, false],
    ]
    it.each(itemCancelTests)('should %s when %s is cancelled', async (expected, view) => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={view}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        groupIndex={0}
        itemIndex={0}
        setItemIndex={setItemIndex}
      />);
      screen.getByText(/cancel/i).click();
      expect(setView).toBeCalledWith(expected);
    });
    it('should start to update an item from list', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setItemIndex={setItemIndex}
        groupIndex={0}
      />);
      screen.getAllByRole('button', { name: /update value/i })[2].click();
      expect(setView).toBeCalledWith(View.Item_Update);
      expect(setItemIndex).toBeCalledWith(2);
    });
    it('should start to update an item', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Item_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setItemIndex={setItemIndex}
        groupIndex={0}
        itemIndex={2}
      />);
      screen.getByRole('button', { name: /edit/i }).click();
      expect(setView).toBeCalledWith(View.Item_Update);
      expect(setItemIndex).toBeCalledWith(2);
    });
    it('should update an item', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      const expected = '[iC-EDITED]'
      render(<Main
        view={View.Item_Update}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC', lat: 3, lng: 1 }] }]}
        setGroups={setGroups}
        groupIndex={0}
        itemIndex={2}
      />);
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
      screen.getByRole('button', { name: /update item/i }).click();
      expect(setView).toBeCalledWith(View.Item_Read);
      expect(setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: expected, lat: 3, lng: 1 }] }]);
    });
    it('should start to delete an item from list', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setItemIndex={setItemIndex}
        groupIndex={0}
      />);
      screen.getAllByRole('button', { name: /delete value/i })[1].click();
      expect(setView).toBeCalledWith(View.Item_Delete);
      expect(setItemIndex).toBeCalledWith(1);
    });
    it('should start to delete an item', () => {
      const setView = jest.fn();
      const setItemIndex = jest.fn();
      render(<Main
        view={View.Item_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setItemIndex={setItemIndex}
        groupIndex={0}
        itemIndex={1}
      />);
      screen.getByRole('button', { name: /delete/i }).click();
      expect(setView).toBeCalledWith(View.Item_Delete);
      expect(setItemIndex).toBeCalledWith(1);
    });
    it('should delete an item', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Item_Delete}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setGroups={setGroups}
        groupIndex={0}
        itemIndex={1}
      />);
      screen.getByRole('button', { name: /delete item/i }).click();
      expect(setView).toBeCalledWith(View.Items_Read);
      expect(setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iC' }] }]);
    });
    it('should move an item up', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setGroups={setGroups}
        groupIndex={0}
      />);
      screen.getAllByRole('button', { name: /move up/i })[1].click(); // first item cannot be moved up
      expect(setView).toBeCalledWith(View.Items_Read);
      expect(setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iA' }, { name: 'iC' }, { name: 'iB' }] }]);
    });
    it('should move an item down', () => {
      const setView = jest.fn();
      const setGroups = jest.fn();
      render(<Main
        view={View.Items_Read}
        setView={setView}
        groups={[{ name: 'g', items: [{ name: 'iA' }, { name: 'iB' }, { name: 'iC' }] }]}
        setGroups={setGroups}
        groupIndex={0}
      />);
      screen.getAllByRole('button', { name: /move down/i })[0].click();
      expect(setView).toBeCalledWith(View.Items_Read);
      expect(setGroups).toBeCalledWith([{ name: 'g', items: [{ name: 'iB' }, { name: 'iA' }, { name: 'iC' }] }]);
    });
  });
});