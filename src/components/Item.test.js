import { render, screen, waitFor } from '@testing-library/react';

import { Item, newItem } from './Item';

import { View } from '../utils/View';

describe('Item', () => {
    describe('View', () => {
        const viewTests = [
            ['Create', View.Item_Create],
            ['Update', View.Item_Read],
            ['Delete', View.Item_Update],
            ['Create', View.Item_Delete],
        ];
        it.each(viewTests)('should have button of %s when view is %s', (expected, view) => {
            render(<Item
                view={view}
            />);
            const re = new RegExp(expected, 'i');
            const element = screen.queryByRole('button', { name: re });
            expect(element).toBeInTheDocument
        });
        const captionTests = [
            ['[Add Item]', View.Item_Create, '[New Item]'],
            ['here', View.Item_Read, 'here'],
            ['there', View.Item_Update, 'there'],
            ['nowhere', View.Item_Delete, 'nowhere'],
        ]
        it.each(captionTests)('should have title of %s when view is %s and item name is %s', (expected, view, name) => {
            render(<Item
                view={view}
                name={name}
            />);
            const element = screen.queryByTitle('items list')
            expect(element.textContent).toBe(expected);
        });
        describe('read action', () => {
            it('should NOT show distance when reading item without currentLatLng', () => {
                render(<Item
                    view={View.Item_Read}
                    distanceUnit={null}
                    currentLatLng={null}
                />);
                const re = new RegExp('getting location', 'i');
                const element = screen.queryByText(re);
                expect(element).toBeInTheDocument();
            });
            it('should show distance when reading item with currentLatLng', () => {
                const expected = 'DISTANCE_UNIT'
                render(<Item
                    view={View.Item_Read}
                    distanceUnit={expected}
                    currentLatLng={{}}
                />);
                const re = new RegExp(expected);
                const element = screen.queryByText(re);
                expect(element).toBeInTheDocument();
            });
        });
    });
    describe('getMap', () => {
        let oldGeolocation;
        beforeEach(() => {
            oldGeolocation = navigator.geolocation;
        });
        afterEach(() => {
            navigator.geolocation = oldGeolocation;
        });
        it('should have map when currentLatLng is null', () => {
            render(<Item />);
            expect(screen.queryByText(/map disabled/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should have map', () => {
            render(<Item
                currentLatLng={{ lat: 1, lng: 2 }}
            />);
            expect(screen.queryByText(/map disabled/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should say map disabled when it does not have geolocation', () => {
            navigator.geolocation = null;
            render(<Item />);
            expect(screen.queryByText(/map disabled/i)).toBeInTheDocument();
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
        });
    });
});