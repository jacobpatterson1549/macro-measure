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
            const element = screen.queryByTitle('item list')
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
                const expected = 'DISTANCE_UNIT'
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
                    lat={1111}
                    lng={2222}
                />);
                expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
                expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
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
    describe('updateLatLng', () => {
        const latLngTests = [
            [8.9831528, 0, '+(N)'],
            [-8.9831528, 0, '-(S)'],
            [0, -8.9831528, '-(W)'],
            [0, +8.9831528, '+(E)'],
        ];
        it.each(latLngTests)('should update latLng to [%s,%s] when %s button is clicked', async (lat, lng, direction) => {
            navigator.geolocation.watchPosition = jest.fn();
            window.localStorage.getItem.mockReturnValue(1000); // moveAmount
            render(<Item
                view={View.Item_Update}
                lat={0}
                lng={0}
                distanceUnit='km'
            />);
            const element = screen.getByRole('button', { name: direction });
            element.click();
            expect(screen.getByDisplayValue(lat)).toBeInTheDocument();
            expect(screen.getByDisplayValue(lng)).toBeInTheDocument();
        });
    });
});