import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Item } from './Item';

import { useItems } from '../hooks/Database';
import { useGeolocation } from '../hooks/Geolocation';

import { View } from '../utils/View';
import { getLocalStorage } from '../utils/Global';

jest.mock('../hooks/Database');
jest.mock('../hooks/Geolocation');

describe('Item', () => {
    describe('View', () => {
        const actionButtonNames = [
            'create item',
            'update item',
            'delete item',
        ];
        it.each(actionButtonNames)('should have button with title: %s', (expected) => {
            useItems.mockReturnValue([[]]);
            useGeolocation.mockReturnValue({});
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
            useGeolocation.mockReturnValue({});
            render(<Item
                view={view}
                type={'item'}
                itemID={3}
                setGPSOn={jest.fn()}
            />);
            const element = screen.queryByTitle('item list')
            expect(element.textContent).toBe(expected);
        });
        it('should read localStorage with props.type', () => {
            const expected = [
                ['XYZInputName'],
                ['XYZInputLat'],
                ['XYZInputLng'],
                ['moveAmountInput'],
            ];
            useItems.mockReturnValue([[]]);
            useGeolocation.mockReturnValue({});
            render(<Item
                type={'XYZ'}
                setGPSOn={jest.fn()}
            />);
            expect(getLocalStorage().getItem.mock.calls).toEqual(expected);
        });
    });
    describe('update action', () => {
        it('should set form item latLng', () => {
            useItems.mockReturnValue([[{ name: 'something', lat: 1111, lng: 2222, id: 3 }]]);
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                itemID={3}
            />);
            waitFor(() => {
                expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
                expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
            });
        });
        it('should update name', async () => {
            const expected = 'something else';
            const reloadItems = jest.fn().mockResolvedValue();
            useItems.mockReturnValue([[{ name: 'something', lat: 1111, lng: 2222, id: 3 }], reloadItems]);
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                itemID={3}
                updateEnd={jest.fn()}
            />);
            fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: expected } });
            screen.getByRole('button', { name: /update/i }).click();
            waitFor(() => expect(reloadItems).toBeCalled());
        });
    });
    describe('create action', () => {
        beforeEach(() => {
            useItems.mockReturnValue([[]]);
        })
        it('should not crash when creating an item with the max id', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
                itemID={Number.MAX_SAFE_INTEGER}
            />);
            const element = screen.queryByText(/Cancel/i);
            expect(element).toBeInTheDocument();
        });
        it('should have disabled submit when geolocation does not return latLng', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Create}
                type={'item'}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: /create item/i });
            expect(element.disabled).toBeTruthy();
        });
        it('should show map when geolocation returns latLng', async () => {
            useItems.mockReturnValue([[{ lat: 7, lng: -9 }]]);
            useGeolocation.mockReturnValue({
                lat: 7,
                lng: -9,
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
            />);
            await waitFor(() => screen.queryByText(/waiting for/i) === null);
        });
        it('should NOT have disabled submit when geolocation returns latLng', async () => {
            useGeolocation.mockReturnValue({
                lat: 7,
                lng: -9,
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Create}
                type={'item'}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: /create item/i });
            expect(element.disabled).toBeFalsy();
        });
        it('should set localStorage when ended', async () => {
            useGeolocation.mockReturnValue({
                lat: 2,
                lng: 4,
                valid: true,
            });
            const createEnd = jest.fn();
            const reloadItems = jest.fn();
            const name = '[my custom item name]';
            const expected = {
                name: name,
                lat: 2,
                lng: 4,
                parentItemID: 7,
            };
            useItems.mockReturnValue([[], reloadItems]);
            render(<Item
                view={View.Waypoint_Create}
                type={'item'}
                parentItemID={7}
                createEnd={createEnd}
                setGPSOn={jest.fn()}
            />);
            fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: name } });
            await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' }).value).toBe(name));
            screen.getByRole('button', { name: /create item/i }).click();
            expect(createEnd).toBeCalledWith(expected);
            waitFor(expect(reloadItems).toBeCalled);
        });
    });
    describe('delete action', () => {
        it('should call deleteEnd', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            const deleteEnd = jest.fn().mockResolvedValue();
            const reloadItems = jest.fn();
            const expected = { id: 7, name: 'something', lat: 1, lng: -1 };
            useItems.mockReturnValue([[{ id: 6, name: 'BAD', lat: 1, lng: 66 }, expected], reloadItems]);
            render(<Item
                view={View.Waypoint_Delete}
                type={'item'}
                itemID={7}
                deleteEnd={deleteEnd}
                setGPSOn={jest.fn()}
            />);
            screen.getByRole('button', { name: /delete item/i }).click();
            expect(deleteEnd).toBeCalledWith(expected);
            waitFor(() => expect(reloadItems).toBeCalled());
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
            useItems.mockReturnValue([[{ name: 'something', lat: 0, lng: 0, id: 9 }]]);
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Item
                view={View.Waypoint_Update}
                distanceUnit='mi' // moveAmount defaults to 1
                setGPSOn={jest.fn()}
                itemID={9}
            />);
            const element = screen.getByRole('button', { name: direction });
            element.click();
            waitFor(() => {
                expect(screen.getByDisplayValue(lat)).toBeInTheDocument();
                expect(screen.getByDisplayValue(lng)).toBeInTheDocument();
            });
        });
    });
});