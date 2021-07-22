import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { WaypointForm } from './WaypointForm';

import { View } from '../utils/View';
import { getLocalStorage } from '../utils/Global';

jest.mock('../hooks/Geolocation');

describe('WaypointForm', () => {
    describe('View', () => {
        it('should read localStorage with props.type', () => {
            const expected = [
                ['waypointInputName'],
                ['waypointInputLat'],
                ['waypointInputLng'],
                ['moveAmountInput'],
            ];
            render(<WaypointForm
                type={'waypoint'}
                setGPSOn={jest.fn()}
            />);
            expect(getLocalStorage().getItem.mock.calls).toEqual(expected);
        });
    });
    describe('read action', () => {
        it('should NOT show distance when reading item without currentLatLng', () => {
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Read}
                item={{ lat: 7, lng: 8, name: 'something' }}
                distanceUnit={'m'}
                setGPSOn={jest.fn()}
                geolocation={{ valid: true }}
            />);
            const re = new RegExp('getting location', 'i');
            const element = screen.queryByText(re);
            expect(element).toBeInTheDocument();
        });
        it('should show distance when reading item with currentLatLng', async () => {
            const expected = 'km'
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Read}
                distanceUnit={expected}
                setGPSOn={jest.fn()}
                item={{ lat: 7, lng: 9 }}
                distanceHeading={{distance:1988.7}}
            />);
            expect(screen.queryByText('1988.7')).toBeInTheDocument(); // REAL test (lng diff = 18)
            expect(screen.queryByText(expected)).toBeInTheDocument();
        });
        it('should show NaN distance when reading item with currentLatLng and invalid distance unit', async () => {
            const expected = 'INVALID_DISTANCE_UNIT'
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Read}
                distanceUnit={expected}
                setGPSOn={jest.fn()}
                distanceHeading={{distance:NaN}}
            />);
            expect(screen.queryByText('NaN')).toBeInTheDocument();
            expect(screen.queryByText(expected)).toBeInTheDocument();
        });
    });
    describe('update action', () => {
        it('should set form item latLng', () => {
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 1111, lng: 2222 }}
                geolocation={{valid: true}}
            />);
            waitFor(() => {
                expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
                expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
            });
        });
        it('should update name', async () => {
            const expected = 'something else';
            const reloadItems = jest.fn();
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 1111, lng: 2222 }}
                reloadItems={reloadItems}
                updateEnd={jest.fn()}
            />);
            fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: expected } });
            screen.getByRole('button', { name: /update/i }).click();
            waitFor(expect(reloadItems).toBeCalled);
        });
    });
    describe('create action', () => {
        it('should have disabled submit when geolocation does not return latLng', () => {
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
                geolocation={{valid: true}}
            />);
            const element = screen.getByRole('button', { name: /create waypoint/i });
            expect(element.disabled).toBeTruthy();
        });
        it('should show map when geolocation returns latLng', async () => {
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Create}
                item={{ lat: 7, lng: -9 }}
                setGPSOn={jest.fn()}
                geolocation={{
                    lat: 7,
                    lng: -9,
                    valid: true,
                }}
            />);
            await waitFor(() => screen.queryByText(/waiting for/i) === null);
        });
        it('should NOT have disabled submit when geolocation returns latLng', async () => {
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
                geolocation={{
                    lat: 7,
                    lng: -9,
                    valid: true,
                }}
            />);
            const element = screen.getByRole('button', { name: /create waypoint/i });
            expect(element.disabled).toBeFalsy();
        });
        it('should set localStorage when ended', async () => {
            const createEnd = jest.fn();
            const reloadItems = jest.fn();
            const name = '___CUSTOM_NAME_FOR_TEST';
            const expected = {
                name: name,
                lat: 2,
                lng: 4,
                parentItemID: 7,
            };
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Create}
                parentItemID={7}
                reloadItems={reloadItems}
                createEnd={createEnd}
                setGPSOn={jest.fn()}
                geolocation={{
                    lat: 2,
                    lng: 4,
                    valid: true,
                }}
            />);
            fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: name } });
            await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' }).value).toBe(name));
            screen.getByRole('button', { name: /create waypoint/i }).click();
            expect(createEnd).toBeCalledWith(expected);
            waitFor(expect(reloadItems).toBeCalled);
        });
    });
    describe('delete action', () => {
        it('should call deleteEnd', () => {
            const deleteEnd = jest.fn();
            const reloadItems = jest.fn();
            const expected = { name: 'something', lat: 1, lng: -1 };
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Delete}
                item={expected}
                reloadItems={reloadItems}
                deleteEnd={deleteEnd}
                setGPSOn={jest.fn()}
                geolocation={{valid: true}}
            />);
            screen.getByRole('button', { name: /delete waypoint/i }).click();
            expect(deleteEnd).toBeCalledWith(expected);
            waitFor(expect(reloadItems).toBeCalled);
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
            render(<WaypointForm
                type={'waypoint'}
                view={View.Waypoint_Update}
                distanceUnit='mi' // moveAmount defaults to 1
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 0, lng: 0 }}
                geolocation={{valid: true}}
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