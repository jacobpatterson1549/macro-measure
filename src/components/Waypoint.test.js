import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Waypoint } from './Waypoint';

import { useGeolocation } from '../hooks/Geolocation';

import { View } from '../utils/View';
import { getLocalStorage } from '../utils/Global';

jest.mock('../hooks/Geolocation');

describe('Waypoint', () => {
    describe('read action', () => {
        it('should NOT show distance when reading item without currentLatLng', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Read}
                item={{ lat: 7, lng: 8, name: 'something' }}
                distanceUnit={'m'}
                setGPSOn={jest.fn()}
            />);
            const re = new RegExp('getting location', 'i');
            const element = screen.queryByText(re);
            expect(element).toBeInTheDocument();
        });
        it('should show distance when reading item with currentLatLng', async () => {
            const expected = 'km'
            useGeolocation.mockReturnValue({
                lat: 7,
                lng: -9,
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Read}
                distanceUnit={expected}
                setGPSOn={jest.fn()}
                item={{ lat: 7, lng: 9 }}
            />);
            expect(screen.queryByText('1988.7')).toBeInTheDocument(); // REAL test (lng diff = 18)
            expect(screen.queryByText(expected)).toBeInTheDocument();
        });
        it('should show NaN distance when reading item with currentLatLng and invalid distance unit', async () => {
            const expected = 'INVALID_DISTANCE_UNIT'
            useGeolocation.mockReturnValue({
                lat: 7,
                lng: -9,
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Read}
                distanceUnit={expected}
                item={{ name: 'something', lat: 7, lng: -9 }}
                setGPSOn={jest.fn()}
            />);
            expect(screen.queryByText('NaN')).toBeInTheDocument();
            expect(screen.queryByText(expected)).toBeInTheDocument();
        });
    });
    describe('update action', () => {
        it('should set form item latLng', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Update}
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 1111, lng: 2222 }}
            />);
            waitFor(() => {
                expect(screen.getByDisplayValue('1111')).toBeInTheDocument();
                expect(screen.getByDisplayValue('2222')).toBeInTheDocument();
            });
        });
    });
    describe('create action', () => {
        it('should not crash when creating an item with the max id', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
                itemID={Number.MAX_SAFE_INTEGER}
            />);
            const element = screen.queryByText(/waiting for/i);
            expect(element).toBeInTheDocument();
        });
        it('should not show map when geolocation does not return latLng', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
            />);
            const element = screen.queryByText(/waiting for/i);
            expect(element).toBeInTheDocument();
        });
        it('should have disabled submit when geolocation does not return latLng', () => {
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: /create waypoint/i });
            expect(element.disabled).toBeTruthy();
        });
        it('should show map when geolocation returns latLng', async () => {
            useGeolocation.mockReturnValue({
                lat: 7,
                lng: -9,
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                item={{ lat: 7, lng: -9 }}
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
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                setGPSOn={jest.fn()}
            />);
            const element = screen.getByRole('button', { name: /create waypoint/i });
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
            const name = '___CUSTOM_NAME_FOR_TEST';
            const expected = {
                name: name,
                lat: 2,
                lng: 4,
                parentItemID: 7,
            };
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Create}
                parentItemID={7}
                reloadItems={reloadItems}
                createEnd={createEnd}
                setGPSOn={jest.fn()}
            />);
            fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: name } });
            await waitFor(() => expect(screen.getByRole('textbox', { name: 'Name' }).value).toBe(name));
            screen.getByRole('button', { name: /create waypoint/i }).click();
            expect(createEnd).toBeCalledWith(expected);
            waitFor(expect(reloadItems).toBeCalled);
        });
    });
    describe('getMap', () => {
        it('should have map when currentLatLng is null', () => {
            useGeolocation.mockReturnValue({ valid: true });
            render(<Waypoint
                type={'waypoint'}
                item={{ lat: 7, lng: 9 }}
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 1, lng: 2 }}
            />);
            waitFor(expect(screen.queryByRole('img')).toBeInTheDocument);
        });
        it('should have map', async () => {
            useGeolocation.mockReturnValue({ valid: true });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Read}
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 1, lng: 2 }}
            />);
            waitFor(expect(screen.queryByRole('img')).toBeInTheDocument);
        });
        it('should say map disabled when it does not have geolocation', () => {
            useGeolocation.mockReturnValue({
                valid: false,
            });
            render(<Waypoint
                type={'waypoint'}
                setGPSOn={jest.fn()}
            />);
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
            useGeolocation.mockReturnValue({
                valid: true,
            });
            render(<Waypoint
                type={'waypoint'}
                view={View.Waypoint_Update}
                distanceUnit='mi' // moveAmount defaults to 1
                setGPSOn={jest.fn()}
                item={{ name: 'something', lat: 0, lng: 0 }}
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