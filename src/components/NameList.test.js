import { render, screen, fireEvent } from '@testing-library/react';

import { NameList } from './NameList';

import { useItems } from '../hooks/Database';

import { View } from '../utils/View';

jest.mock('../hooks/Database', () => ({
    useItems: jest.fn(),
}));

describe('NameList', () => {
    const items = [
        { name: 'a', id: '1Z' },
        { name: 'b', id: '2Z' },
        { name: 'c', id: '3Z' },
    ];
    const reloadItems = jest.fn();
    beforeEach(() => {
        reloadItems.mockReset()
        useItems.mockReturnValue([items, reloadItems]);
    });
    describe('View', () => {
        const viewTests = [
            ['Create', View.Group_Create],
            ['Update', View.Group_Update],
            ['Delete', View.Group_Delete],
            ['Create', View.Group_List],
        ];
        it.each(viewTests)('should have one button of %s when view is %s', (expected, view) => {
            render(<NameList
                type={'test'}
                view={view}
            />);
            const re = new RegExp(expected);
            const element = screen.getByRole('button', { name: re });
            expect(element.value).toContain(expected);
        });
    });
    describe('handlers', () => {
        describe('start', () => {
            it('should start creating when the create button is clicked', () => {
                const createStart = jest.fn();
                render(<NameList
                    type={'test'}
                    view={View.Waypoint_Read}
                    createStart={createStart}
                />);
                const element = screen.getByRole('button', { name: /test/ });
                fireEvent.click(element);
                expect(createStart).toBeCalled();
            });
            it('should start updating when the edit button is clicked', () => {
                const updateStart = jest.fn();
                const expected = items[1];
                render(<NameList
                    type={'test'}
                    view={View.Group_List}
                    itemID={expected}
                    updateStart={updateStart}
                />);
                const elements = screen.getAllByRole('button', { name: 'update value' });
                const element = elements[1];
                fireEvent.click(element);
                expect(elements.length).toBe(items.length);
                expect(updateStart).toBeCalledWith(expected);
            });
            it('should start deleting when the delete button is clicked', () => {
                const deleteStart = jest.fn();
                render(<NameList
                    type={'test'}
                    view={View.Group_List}
                    deleteStart={deleteStart}
                />);
                const elements = screen.getAllByRole('button', { name: 'delete value' });
                const expected = items[2];
                const element = elements[2];
                fireEvent.click(element);
                expect(elements.length).toBe(items.length);;
                expect(deleteStart).toBeCalledWith(expected);
            });
        });
        describe('finish', () => {
            it('should finish creating when the form is submitted', () => {
                const name = 'create_name_8';
                const expected = { name: name };
                window.localStorage.getItem.mockReturnValue(JSON.stringify(name));
                const createEnd = jest.fn();
                render(<NameList
                    type={'test'}
                    view={View.Group_Create}
                    createEnd={createEnd}
                />);
                const element = screen.getByRole('button', { name: 'Create test' });
                fireEvent.submit(element);
                expect(createEnd).toBeCalledWith(expected);
            });
            it('should finish updating when the form is submitted', () => {
                const name = 'update_name_6';
                const expected = { name: name, id: '2Z' };
                window.localStorage.getItem.mockReturnValue(JSON.stringify(name));
                const updateEnd = jest.fn();
                render(<NameList
                    type={'test'}
                    view={View.Group_Update}
                    itemID={expected.id}
                    updateEnd={updateEnd}
                />);
                const element = screen.getByRole('button', { name: 'Update test' });
                fireEvent.submit(element);
                expect(updateEnd).toBeCalledWith(expected);
            });
            it('should finish deleting when the form is submitted', () => {
                const deleteEnd = jest.fn();
                const expected = '3Z';
                render(<NameList
                    type={'test'}
                    view={View.Group_Delete}
                    itemID={expected}
                    deleteEnd={deleteEnd}
                />);
                const element = screen.getByRole('button', { name: 'Delete test' });
                fireEvent.submit(element);
                expect(deleteEnd).toBeCalledWith(expected);
            });
        });
    });
});