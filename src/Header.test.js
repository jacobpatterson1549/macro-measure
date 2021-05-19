import { render, screen, fireEvent } from '@testing-library/react';

import { Header } from './Header';
import { View } from './View';

describe('Header', () => {
    describe('each item', () => {
        const titleParts = [
            ['groups', View.Groups_Read],
            ['about', View.About],
            ['help', View.Help],
            ['settings', View.Settings],
        ];
        test.each(titleParts)('header should have item with title containing %s', (expected) => {
            render(<Header />);
            const re = new RegExp(expected);
            const headerElement = screen.getByTitle(re);
            expect(headerElement).toBeInTheDocument();
        });
        test.each(titleParts)('%s header element should be clickable', (titlePart, expected) => {
            const handleClick = jest.fn();
            render(<Header setView={handleClick} />);
            const re = new RegExp(titlePart);
            const headerElement = screen.getByTitle(re);
            fireEvent.click(headerElement);
            expect(handleClick).toHaveBeenCalledWith(expected);
        });
    });
    const groupNames = [
        [null, null, '[Groups]'],
        [View.Settings, 'any', '[Groups]'],
        [View.Groups_Read, 'ignore', '[Groups]'],
        [View.Items_Read, 'groupA', 'groupA'],
        [View.Item_Create, 'groupB', 'groupB'],
        [View.Item_Read, 'groupC', 'groupC'],
        [View.Item_Update, 'groupD', 'groupD'],
        [View.Item_Delete, 'groupE', 'groupE'],
        [View.Item_No_Geolocation, 'groupF', 'groupF'],
    ];
    test.each(groupNames)('when view is %s and current group name is %s, groups header text content should be %s ', (view, groupName, expected) => {
        const groups = [{ name: groupName }];
        const groupIndex = 0;
        render(<Header view={view} groups={groups} groupIndex={groupIndex} />);
        const groupElement = screen.getByTitle(/group/);
        expect(groupElement).toHaveTextContent(expected);
    });
});