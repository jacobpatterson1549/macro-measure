import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { Item } from './Item';

import { View } from '../utils/View';

describe('Item', () => {
    describe('View', () => {
        const actionButtonNames = [
            'create item',
            'update item',
            'delete item',
        ];
        it.each(actionButtonNames)('should have button with title: %s', (expected) => {
            render(<Item
                view={View.Item_Read}
                items={[{}]}
                index={0}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: expected });
            expect(element).toBeInTheDocument();
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
                items={[{ name: name }]}
                index={0}
                setGPSOn={jest.fn()}
            />);
            const element = screen.queryByTitle('item list')
            expect(element.textContent).toBe(expected);
        });
        describe('read action', () => {
            it('should NOT show distance when reading item without currentLatLng', () => {
                render(<Item
                    view={View.Item_Read}
                    items={[{}]}
                    index={0}
                    distanceUnit={null}
                    setGPSOn={jest.fn()}
                />);
                const re = new RegExp('getting location', 'i');
                const element = screen.queryByText(re);
                expect(element).toBeInTheDocument();
            });
            it('should show distance when reading item with currentLatLng', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                const expected = 'km'
                window.localStorage.getItem.mockImplementation((key) => key === 'itemInputLatLng' ? '{"lat":7,"lng":9}' : null);
                render(<Item
                    view={View.Item_Read}
                    items={[{}]} // the latLng is read from the state
                    index={0}
                    distanceUnit={expected}
                    setGPSOn={jest.fn()}
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
                    items={[{ lat: 7, lng: 9 }]}
                    index={0}
                    distanceUnit={expected}
                    setGPSOn={jest.fn()}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                expect(screen.queryByText('NaN')).toBeInTheDocument();
                expect(screen.queryByText(expected)).toBeInTheDocument();
            });
        });
        describe('update action', () => {
            it('should set form item latLng', async () => {
                window.localStorage.getItem.mockImplementation((key) => key === 'itemInputLatLng' ? '{"lat":1111,"lng":2222}' : null);
                render(<Item
                    view={View.Item_Update}
                    items={[{}]} // the latLng is read from the state
                    index={0}
                    setGPSOn={jest.fn()}
                />);
                expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
                expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
            });
        });
        describe('create action', () => {
            it('should not show map when geolocation does not return latLng', () => {
                render(<Item
                    view={View.Item_Create}
                    setGPSOn={jest.fn()}
                />);
                const element = screen.queryByText(/waiting for/i);
                expect(element).toBeInTheDocument();
            });
            it('should have disabled submit when geolocation does not return latLng', () => {
                render(<Item
                    view={View.Item_Create}
                    setGPSOn={jest.fn()}
                />);
                const element = screen.getByRole('button', { name: /create item/i });
                expect(element.disabled).toBeTruthy();
            });
            it('should show map when geolocation does not return latLng', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                render(<Item
                    view={View.Item_Create}
                    setGPSOn={jest.fn()}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                const element = screen.queryByText(/waiting for/i);
                expect(element).not.toBeInTheDocument();
            });
            it('should NOT have disabled submit when geolocation returns latLng', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                render(<Item
                    view={View.Item_Create}
                    setGPSOn={jest.fn()}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                const element = screen.getByRole('button', { name: /create item/i });
                expect(element.disabled).toBeFalsy();
            });
            it('should set localStorage when ended', async () => {
                const createEnd = jest.fn();
                const expected = '[my custom item name]';
                render(<Item
                    view={View.Item_Create}
                    items={[]}
                    index={0}
                    createEnd={createEnd}
                    setGPSOn={jest.fn()}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 2, longitude: 4, } }));
                fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
                screen.getByRole('button', { name: /create item/i }).click();
                expect(createEnd).toBeCalledWith(expected, 2, 4);
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
                render(<Item
                    items={[{ lat: 7, lng: 9 }]}
                    index={0}
                    setGPSOn={jest.fn()}
                />);
                expect(screen.queryByRole('img')).toBeInTheDocument();
            });
            it('should have map', async () => {
                navigator.geolocation.watchPosition = jest.fn();
                render(<Item
                    view={View.Item_Read}
                    items={[{ lat: 0, lng: 0 }]}
                    index={0}
                    setGPSOn={jest.fn()}
                />);
                const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
                await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
                expect(screen.queryByRole('img')).toBeInTheDocument();
            });
            it('should say map disabled when it does not have geolocation', () => {
                navigator.geolocation = null;
                render(<Item setGPSOn={jest.fn()} />);
                expect(screen.queryByText(/map disabled/i)).toBeInTheDocument();
            });
        });
        describe('updateLatLng', () => {
            const latLngTests = [
                [+0.014457, 0, '+(N)'],
                [-0.014457, 0, '-(S)'],
                [0, -0.014457, '-(W)'],
                [0, +0.014457, '+(E)'],
            ];
            it.each(latLngTests)('should update latLng to [%s,%s] when %s button is clicked', async (lat, lng, direction) => {
                navigator.geolocation.watchPosition = jest.fn();
                render(<Item
                    view={View.Item_Update}
                    items={[{ lat: 0, lng: 0 }]}
                    index={0}
                    distanceUnit='mi' // moveAmount defaults to 1
                    setGPSOn={jest.fn()}
                />);
                const element = screen.getByRole('button', { name: direction });
                element.click();
                expect(screen.getByDisplayValue(lat)).toBeInTheDocument();
                expect(screen.getByDisplayValue(lng)).toBeInTheDocument();
            });
        });
    });
});