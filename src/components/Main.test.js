import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Main } from './Main';

import { createHandlers, useItem, useItems } from '../hooks/Database';
import { useGeolocation } from '../hooks/Geolocation';

import { getAll as getAllDatabase } from '../utils/Database';

import { View } from '../utils/View';

jest.mock('../hooks/Database');
jest.mock('../hooks/Geolocation');
jest.mock('../utils/Database');

describe('Main', () => {
  beforeEach(() => {
    useItem.mockReturnValue([[]]);
    useItems.mockReturnValue([[], jest.fn()]);
    useGeolocation.mockReturnValue({
      valid: true,
    });
  });
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
      expect(screen.getByRole('button', { name: /create /i })).toBeInTheDocument();
    });
  });
  describe('CRUD handlers', () => {
    let handlers;
    beforeEach(() => {
      handlers = {
        createStart: jest.fn(),
        createEnd: jest.fn(),
        read: jest.fn(),
        list: jest.fn(),
        updateStart: jest.fn(),
        updateEnd: jest.fn(),
        deleteStart: jest.fn(),
        deleteEnd: jest.fn(),
        moveUp: jest.fn(),
        moveDown: jest.fn(),
      };
      createHandlers.mockReturnValue(handlers);
    });
    describe('group', () => {
      it('should start to create a group', () => {
        render(<Main
          view={View.Group_List}
        />);
        screen.getByRole('button', { name: /create group/i }).click();
        expect(handlers.createStart).toBeCalled();
      });
      it('should create a group', () => {
        const name = '[my custom group name]';
        const expected = { name: name };
        render(<Main
          view={View.Group_Create}
        />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: name } });
        screen.getByRole('button', { name: /create group/i }).click();
        expect(handlers.createEnd).toBeCalledWith(expected);
      });
      it('should read a group', async () => {
        const expected = { name: 'groupB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_List}
        />);
        screen.getByText('groupB').click();
        expect(handlers.read).toBeCalledWith(expected);
      });
      it.each([View.Group_Create, View.Group_Update, View.Group_Delete])('should read groups when %s is cancelled', (view) => {
        render(<Main
          view={view}
        />);
        screen.getByText(/cancel/i).click();
        expect(handlers.list).toBeCalled();
      });
      it('should start to update a group', () => {
        const expected = { name: 'groupC', id: 'c' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_List}
        />);
        screen.getAllByRole('button', { name: /update/i })[2].click();
        expect(handlers.updateStart).toBeCalledWith(expected);
      });
      it('should update a group', () => {
        const name = '[groupC-EDITED]';
        const expected = { name: name, id: 'c' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_Update}
          groupID={expected.id}
        />);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: name } });
        screen.getByRole('button', { name: /update group/i }).click();
        expect(handlers.updateEnd).toBeCalledWith(expected);
      });
      it('should start to delete a group', () => {
        const expected = { name: 'groupB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_List}
        />);
        screen.getAllByRole('button', { name: /delete/i })[1].click();
        expect(handlers.deleteStart).toBeCalledWith(expected);
      });
      it('should delete a group', () => {
        const expected = 'b';
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_Delete}
          groupID={expected}
        />);
        screen.getByRole('button', { name: /delete group/i }).click();
        expect(handlers.deleteEnd).toBeCalledWith(expect.objectContaining({ id: 'b'}));
      });
      it('should move a group up', () => {
        const expected = { name: 'groupC', id: 'c' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_List}
        />);
        screen.getAllByRole('button', { name: /move up/i })[1].click(); // first group cannot be moved up
        expect(handlers.moveUp).toBeCalledWith(expected);
      });
      it('should move a group down', () => {
        const expected = { name: 'groupA', id: 'a' };
        useItems.mockReturnValue([
          [{ name: 'groupA', id: 'a' }, { name: 'groupB', id: 'b' }, { name: 'groupC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Group_List}
        />);
        screen.getAllByRole('button', { name: /move down/i })[0].click();
        expect(handlers.moveDown).toBeCalledWith(expected);
      });
    });
    describe('waypoint', () => {
      it('should start to create an waypoint from list', () => {
        render(<Main
          view={View.Waypoint_List}
        />);
        screen.getByRole('button', { name: /create waypoint/i }).click();
        expect(handlers.createStart).toBeCalled();
      });
      it('should start to create a waypoint', () => {
        render(<Main
          view={View.Waypoint_Read}
          setGPSOn={jest.fn()}
        />);
        screen.getByRole('button', { name: /create waypoint/i }).click();
        expect(handlers.createStart).toBeCalled();
      });
      it('should create a waypoint', () => {
        useItems.mockReturnValue([null, jest.fn()]);
        useGeolocation.mockReturnValue({
          lat: 7,
          lng: -9,
          valid: true,
        });
        const parentItemID = 33;
        const name = '[my custom waypoint name]';
        const expected = {
          name: name,
          lat: 7,
          lng: -9,
          parentItemID: parentItemID,
        }
        render(<Main
          view={View.Waypoint_Create}
          groupID={parentItemID}
          setGPSOn={jest.fn()}
        />);
        fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: name } });
        screen.getByRole('button', { name: /create waypoint/i }).click();
        expect(handlers.createEnd).toBeCalledWith(expected);
      });
      it('should read a waypoint', () => {
        const expected = { name: 'iB', id: 'b', order: 2 };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a', order: 1 }, { name: 'iB', id: 'b', order: 2 }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_List}
          setGPSOn={jest.fn()}
        />);
        screen.getByText('iB').click();
        expect(handlers.read).toBeCalledWith(expected);
      });
      const itemArrowReadTests = [
        ['previous waypoint', 0],
        ['next waypoint', 2],
      ];
      it.each(itemArrowReadTests)('should read the %s', (buttonName, expectedIndex) => {
        const waypoints = [{ name: 'iA', id: 'a', order: 0 }, { name: 'iB', id: 'b', order: 1 }, { name: 'iC', id: 'c', order: 2 }];
        const expected = waypoints[expectedIndex];
        useItems.mockReturnValue([
          waypoints,
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_Read}
          waypointID={'b'}
          setGPSOn={jest.fn()}
        />);
        screen.getByRole('button', { name: buttonName }).click();
        expect(handlers.read).toBeCalledWith(expected);
      });
      it('should read waypoints when create is cancelled', async () => {
        render(<Main
          view={View.Waypoint_Create}
          setGPSOn={jest.fn()}
        />);
        screen.getByText(/cancel/i).click();
        expect(handlers.list).toBeCalledWith();
      });
      const itemCancelTests = [
        View.Waypoint_Update,
        View.Waypoint_Delete,
      ]
      it.each(itemCancelTests)('should read waypoints when %s is cancelled', (view) => {
        const expected = { name: 'iB', id: 'b', order: 2, lat: 0, lng: 0 };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a', order: 1 }, { name: 'iB', id: 'b', order: 2, lat: 0, lng: 0 }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={view}
          waypointID={expected.id}
          setGPSOn={jest.fn()}
        />);
        screen.getByText(/cancel/i).click();
        expect(handlers.read).toBeCalledWith(expected);
      });
      it('should start to update a waypoint from list', () => {
        const expected = { name: 'iC', id: 'c' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_List}
        />);
        screen.getAllByRole('button', { name: /update value/i })[2].click();
        expect(handlers.updateStart).toBeCalledWith(expected);
      });
      it('should start to update a waypoint', () => {
        const expected = { name: 'iC', id: 'c' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c' }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_Read}
          waypointID={expected.id}
          setGPSOn={jest.fn()}
        />);
        screen.getByRole('button', { name: /update waypoint/i }).click();
        expect(handlers.updateStart).toBeCalledWith(expected);
      });
      it('should update a waypoint', () => {
        const name = '[iC-EDITED]'
        const expected = { name: name, id: 'c', order: 3, lat: 4, lng: 1 };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3, lat: 4, lng: 1 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_Update}
          waypointID={expected.id}
          setGPSOn={jest.fn()}
        />);
        fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: name } });
        screen.getByRole('button', { name: /update waypoint/i }).click();
        waitFor(() => expect(handlers.updateEnd).toBeCalledWith(expected)); // TODO: move position, ensure the changed values are called here
      });
      it('should start to delete an waypoint from list', () => {
        const expected = { name: 'iB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_List}
          setGPSOn={jest.fn()}
        />);
        screen.getAllByRole('button', { name: /delete value/i })[1].click();
        expect(handlers.deleteStart).toBeCalledWith(expected);
      });
      it('should start to delete a waypoint', () => {
        const expected = { name: 'iB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_Read}
          waypointID={expected.id}
          setGPSOn={jest.fn()}
        />);
        screen.getByRole('button', { name: /delete waypoint/i }).click();
        expect(handlers.deleteStart).toBeCalledWith(expected);
      });
      it('should delete a waypoint', () => {
        const expected = { name: 'iB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_Delete}
          waypointID={expected.id}
          setGPSOn={jest.fn()}
        />);
        screen.getByRole('button', { name: /delete waypoint/i }).click();
        expect(handlers.deleteEnd).toBeCalledWith(expected);
      });
      it('should move a waypoint up', () => {
        const expected = { name: 'iB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_List}
        />);
        screen.getAllByRole('button', { name: /move up/i })[0].click(); // first item cannot be moved up
        expect(handlers.moveUp).toBeCalledWith(expected);
      });
      it('should move a waypoint down', () => {
        const expected = { name: 'iB', id: 'b' };
        useItems.mockReturnValue([
          [{ name: 'iA', id: 'a' }, { name: 'iB', id: 'b' }, { name: 'iC', id: 'c', order: 3 }],
          jest.fn(),
        ]);
        render(<Main
          view={View.Waypoint_List}
        />);
        screen.getAllByRole('button', { name: /move down/i })[1].click();
        expect(handlers.moveDown).toBeCalledWith(expected);
      });
    });
  });
  describe('settings', () => {
    it('should toggle setHighAccuracyGPS', () => {
      render(<Main
        view={View.Settings}
      />);
      const element = screen.getByRole('checkbox', { name: /GPS/ });
      element.click(); // will crash if state props are not correctly appended to inherited props
      expect(element.checked).toBe(true);
    });
    it('should pass db to settings to export storage', async () => {
      const mockDB = 'mock database 97';
      render(<Main
        view={View.Settings}
        db={mockDB}
      />);
      const exportElement = screen.getByLabelText(/export/i);
      fireEvent.click(exportElement);
      await waitFor(() => expect(getAllDatabase).toBeCalledWith(mockDB));
    });
  });
});