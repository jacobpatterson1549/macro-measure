import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { Item } from './Item';

import { useItems } from '../hooks/Database';

import { View } from '../utils/View';

jest.mock('../hooks/Database', () => ({
    useItems: jest.fn(),
}));

describe('Item', () => {
    describe('View', () => {
        const actionButtonNames = [
            'create item',
            'update item',
            'delete item',
        ];
        it.each(actionButtonNames)('should have button with title: %s', (expected) => {
            useItems.mockReturnValue([[]]);
            render(<Item
                view={View.Waypoint_Read}
                type={'item'}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: expected });
            expect(element).toBeInTheDocument();
        });
        const captionTests = [
            ['[Add item]', View.Waypoint_Create, '[New Item]'],
            ['here', View.Waypoint_Read, 'here'],
            ['there', View.Waypoint_Update, 'there'],
            ['nowhere', View.Waypoint_Delete, 'nowhere'],
        ]
        it.each(captionTests)('should have title of %s when view is %s and item name is %s', (expected, view, name) => {
            useItems.mockReturnValue([[{ name: name, id: 3 }]]);
            render(<Item
                view={view}
                type={'item'}
                itemID={3}
                setGPSOn={jest.fn()}
            />);
            const element = screen.queryByTitle('item list')
            expect(element.textContent).toBe(expected);
        });
    });
    describe('read action', () => {
        it('should NOT show distance when reading item without currentLatLng', () => {
            useItems.mockReturnValue([[{}]]);
            render(<Item
                view={View.Waypoint_Read}
                items={[{ id: 4 }]}
                itemID={4}
                distanceUnit={'m'}
                setGPSOn={jest.fn()}
            />);
            const re = new RegExp('getting location', 'i');
            const element = screen.queryByText(re);
            expect(element).toBeInTheDocument();
        });
        it('should show distance when reading item with currentLatLng', async () => {
            navigator.geolocation.watchPosition = jest.fn();
            const expected = 'km'
            useItems.mockReturnValue([[{ lat: 7, lng: 9, id: 8 }]]);
            render(<Item
                view={View.Waypoint_Read}
                distanceUnit={expected}
                setGPSOn={jest.fn()}
                itemID={8}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
            expect(screen.queryByText('1988.7')).toBeInTheDocument(); // REAL test (lng diff = 18)
            expect(screen.queryByText(expected)).toBeInTheDocument();
        });
        it('should show NaN distance when reading item with currentLatLng and invalid distance unit', async () => {
            navigator.geolocation.watchPosition = jest.fn();
            const expected = 'DISTANCE_UNIT'
            useItems.mockReturnValue([[]]);
            render(<Item
                view={View.Waypoint_Read}
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
        it('should set form item latLng', () => {
            useItems.mockReturnValue([[{ name: 'something', lat: 1111, lng: 2222, id: 3 }]]);
            render(<Item
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                itemID={3}
            />);
            expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
        });
        it.only('should update name', async () => {
            const expected = 'something else';
            useItems.mockReturnValue([[{ name: 'something', lat: 1111, lng: 2222, id: 3 }]]);
            const { container } = render(<Item
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                itemID={3}
                updateEnd={jest.fn()}
            />);
            fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: expected } });
            screen.getByRole('button', { name: /update/i }).click();
            const nameElement = container.querySelector('.name'); // TODO: hack! find better way to query item title (between arrows)
            expect(nameElement.textContent).toBe(expected);
        });
    });
    describe('create action', () => {
        beforeEach(() => {
            useItems.mockReturnValue([[]]);
        })
        it('should not show map when geolocation does not return latLng', () => {
            render(<Item
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
            />);
            const element = screen.queryByText(/waiting for/i);
            expect(element).toBeInTheDocument();
        });
        it('should have disabled submit when geolocation does not return latLng', () => {
            render(<Item
                view={View.Waypoint_Create}
                type={'item'}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: /create item/i });
            expect(element.disabled).toBeTruthy();
        });
        it('should show map when geolocation does not return latLng', async () => {
            navigator.geolocation.watchPosition = jest.fn();
            render(<Item
                view={View.Waypoint_Create}
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
                view={View.Waypoint_Create}
                type={'item'}
                setGPSOn={jest.fn()}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
            const element = screen.getByRole('button', { name: /create item/i });
            expect(element.disabled).toBeFalsy();
        });
        it('should set localStorage when ended', async () => {
            const createEnd = jest.fn();
            const name = '[my custom item name]';
            const expected = {
                name: name,
                lat: 2,
                lng: 4,
                parentItemID: 7,
            };
            useItems.mockReturnValue([[]]);
            render(<Item
                view={View.Waypoint_Create}
                type={'item'}
                parentItemID={7}
                createEnd={createEnd}
                setGPSOn={jest.fn()}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            await waitFor(() => successCallback({ coords: { latitude: 2, longitude: 4, } }));
            fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: name } });
            screen.getByRole('button', { name: /create item/i }).click();
            expect(createEnd).toBeCalledWith(expected);
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
            useItems.mockReturnValue([[{ lat: 7, lng: 9, id: 3 }]]);
            render(<Item
                itemId={3}
                setGPSOn={jest.fn()}
            />);
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should have map', async () => {
            navigator.geolocation.watchPosition = jest.fn();
            useItems.mockReturnValue([[]]);
            render(<Item
                view={View.Waypoint_Read}
                setGPSOn={jest.fn()}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
            expect(screen.queryByRole('img')).toBeInTheDocument();
        });
        it('should say map disabled when it does not have geolocation', () => {
            navigator.geolocation = null;
            useItems.mockReturnValue([[]]);
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
            useItems.mockReturnValue([[]]);
            render(<Item
                view={View.Waypoint_Update}
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