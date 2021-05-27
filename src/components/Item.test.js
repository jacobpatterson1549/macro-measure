import { render, screen, waitFor } from '@testing-library/react';

import { Item } from './Item';

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
                />);
                const re = new RegExp('getting location', 'i');
                const element = screen.queryByText(re);
                expect(element).toBeInTheDocument();
            });
            it('should show distance when reading item with currentLatLng', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                const expected = 'km'
                render(<Item
                    view={View.Item_Read}
                    distanceUnit={expected}
                    lat={7}
                    lng={9}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                expect(screen.queryByText('1988.7')).toBeInTheDocument(); // REAL test (lng diff = 18)
                expect(screen.queryByText(expected)).toBeInTheDocument();
            });
            it('should show NaN distance when reading item with currentLatLng and invalid distance unit', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                const expected = 'DISTNANCE_UNIT'
                render(<Item
                    view={View.Item_Read}
                    distanceUnit={expected}
                    lat={7}
                    lng={9}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                expect(screen.queryByText('NaN')).toBeInTheDocument();
                expect(screen.queryByText(expected)).toBeInTheDocument();
            });
        });
        describe('update action', () => {
            it('should set form item latLng', () => {
                render(<Item
                    view={View.Item_Update}
                    lat={1}
                    lng={2}
                />);
                expect(screen.getByTitle('latitude').value).toBe('1');
                expect(screen.getByTitle('longitude').value).toBe('2');
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
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should have map', async () => {
            navigator.geolocation.watchPosition = jest.fn();
            render(<Item
                view={View.Item_Read}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should say map disabled when it does not have geolocation', () => {
            navigator.geolocation = null;
            render(<Item />);
            expect(screen.queryByText(/map disabled/i)).toBeInTheDocument();
        });
    });
});