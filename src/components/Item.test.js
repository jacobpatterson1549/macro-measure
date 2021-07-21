import { render, screen } from '@testing-library/react';

import { Item } from './Item';

import { useItems } from '../hooks/Database';

import { View } from '../utils/View';

jest.mock('../hooks/Database');
jest.mock('../utils/View');

describe('Item', () => {
    beforeEach(() => {
        View.isRead = jest.fn();
        View.isCreate = jest.fn();
        View.AllIDs = [];
    });
    describe('View', () => {
        const actionButtonNames = [
            'create item',
            'update item',
            'delete item',
        ];
        it.each(actionButtonNames)('should have button with title: %s', (expected) => {
            useItems.mockReturnValue([[]]);
            View.isRead.mockReturnValue(true);
            render(<Item
                type={'item'}
            />);
            expect(screen.getByRole('button', { name: expected })).toBeInTheDocument();
        });
        const captionTests = [
            ['[Add item]', '[user-defined name of item being added]', true, false],
            ['--read', '--read', false, true],
            ['UPDATE','UPDATE', false, false],
            ['.delete', '.delete', false, false],
        ]
        it.each(captionTests)('should have title of %s when item name is %s', (expected, name, viewIsCreate, viewIsRead) => {
            useItems.mockReturnValue([[{ name: name, id: 3 }]]);
            View.isCreate.mockReturnValue(viewIsCreate);
            View.isRead.mockReturnValue(viewIsRead);
            const mockView = '[mock view]';
            render(<Item
                view={mockView}
                type={'item'}
                itemID={3}
            />);
            const element = screen.queryByTitle('item list')
            expect(element.textContent).toBe(expected);
            expect(View.isCreate).toBeCalledWith(mockView);
            expect(View.isRead).toBeCalledWith(mockView);
        });
    });
    describe('button handlers', () => {
        describe('crud buttons', () => {
            const currentItem = { id: 3 };
            const crudButtonTests = [
                ['update item', 'updateStart', [currentItem]],
                ['delete item', 'deleteStart', [currentItem]],
                ['create item', 'createStart', []],
            ]
            it.each(crudButtonTests)('should trigger %s handler when clicked', (buttonTitle, handlerName, expected) => {
                useItems.mockReturnValue([[currentItem]]);
                View.isRead.mockReturnValue(true);
                const handler = jest.fn();
                render(<Item
                    type={'item'}
                    itemID={currentItem.id}
                    {...{ [handlerName]: handler }}
                />);
                screen.getByRole('button', { name: buttonTitle }).click();
                expect(handler).toBeCalledWith(...expected);
            });
        });
        describe('read buttons', () => {
            const items = [
                { id: 'a', order: 0 },
                { id: 'd', order: 1 },
                { id: 'c', order: 2 },
                { id: 'b', order: 3 },
                { id: 'e', order: 4 },
            ]
            const disabledTests = [
                ['previous item', 'a'],
                ['next item', 'e'],
            ];
            it.each(disabledTests)('should have disabled "%s" button when reading item with id %s', (buttonTitle, itemID) => {
                useItems.mockReturnValue([items]);
                render(<Item
                    type={'item'}
                    itemID={itemID}
                />);
                const element = screen.getByRole('button', { name: buttonTitle });
                expect(element.disabled).toBeTruthy();
            });
            const readButtonTests = [
                ['previous ITEM', 'd', items[0]],
                ['previous ITEM', 'b', items[2]],
                ['previous ITEM', 'e', items[3]],
                ['next ITEM', 'a', items[1]],
                ['next ITEM', 'd', items[2]],
                ['next ITEM', 'b', items[4]],
            ];
            it.each(readButtonTests)('should read "%s" when at itemID=%s: %s', (buttonTitle, itemID, expected) => {
                useItems.mockReturnValue([items]);
                const readHandler = jest.fn();
                render(<Item
                    type={'ITEM'}
                    itemID={itemID}
                    read={readHandler}
                />);
                const element = screen.getByRole('button', { name: buttonTitle });
                expect(element.disabled).toBeFalsy();
                element.click();
                expect(readHandler.mock.calls).toEqual([[expected]]);
            });
            it('should read the list when item name is clicked', () => {
                useItems.mockReturnValue([]);
                const listHandler = jest.fn();
                render(<Item
                    type={'ITEM'}
                    list={listHandler}
                />);
                screen.getByTitle('ITEM list').click();
                expect(listHandler).toBeCalled();
            });
        });
    });
    it('should display error for unknown view type', () => {
        useItems.mockReturnValue([[]]);
        render(<Item
            type={'unKnown type'}
        />);
        expect(screen.getByText(/No child component for unKnown type/)).toBeInTheDocument();
    });
});