import { render, screen, fireEvent } from '@testing-library/react';

import { Header } from './Header';

import { useItem } from '../hooks/Database';

import { View } from '../utils/View';

jest.mock('../hooks/Database');

describe('Header', () => {
    describe('items', () => {
        beforeEach(() => {
            useItem.mockReturnValue([[]]);
        });
        const titleParts = [
            ['groups', View.Group_List],
            ['about', View.About],
            ['help', View.Help],
            ['settings', View.Settings],
        ];
        it.each(titleParts)('should have item with title containing %s', (expected) => {
            render(<Header />);
            const re = new RegExp(expected);
            const headerElement = screen.getByTitle(re);
            expect(headerElement).toBeInTheDocument();
        });
        it.each(titleParts)('should have %s header element that is clickable', (titlePart, expected) => {
            const handleClick = jest.fn();
            render(<Header setView={handleClick} />);
            const re = new RegExp(titlePart);
            const headerElement = screen.getByTitle(re);
            fireEvent.click(headerElement);
            expect(handleClick).toHaveBeenCalledWith(expected);
        });
    });
    describe('readItem', () => {
        const readItemNameTests = [
            ['[Groups]', null, null],
            ['[Groups]', View.Settings, { name: 'any' }],
            ['[Groups]', View.Group_List, { name: 'ignore' }],
            ['groupA', View.Waypoint_List, { name: 'groupA' }],
            ['groupB', View.Waypoint_Create, { name: 'groupB' }],
            ['groupC', View.Waypoint_Read, { name: 'groupC' }],
            ['groupD', View.Waypoint_Update, { name: 'groupD' }],
            ['groupE', View.Waypoint_Delete, { name: 'groupE' }],
            ['[Groups]', View.Waypoint_Delete, {}],
            ['[Groups]', View.Waypoint_Delete, null],
        ];
        it.each(readItemNameTests)('should have groups link %s and call readGroup when view is %s and groupName is %s', async (expected, view, group) => {
            useItem.mockReturnValue([group]);
            render(<Header
                view={view}
                group={group}
                />);
            const groupElement = screen.getByRole('button', { name: 'groups list' });
            expect(groupElement).toHaveTextContent(expected);
        });
    })
});