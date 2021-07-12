import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import {  useGeolocation } from './Geolocation';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';
import { getGeolocation } from '../utils/Global'

jest.mock('../utils/Geolocation');
jest.mock('../utils/Global', () => ({
    getGeolocation: jest.fn(),
}));

beforeEach(() => {
    roundLatLng.mockImplementation((latLng) => latLng);
});

describe('Geolocation', () => {
    let geolocation;
    beforeEach(() => {
        geolocation = {
            watchPosition: jest.fn(),
            clearWatch: jest.fn(),
        };
        getGeolocation.mockReturnValue(geolocation);
    });
    describe('views', () => {
        const viewTests = [
            [1, View.Waypoint_Create],
            [1, View.Waypoint_Read],
            [0, View.Waypoint_Update],
            [0, View.Waypoint_Delete],
            [0, View.Waypoint_List],
        ];
        it.each(viewTests)('should watch position %d times when view is %s', (expected, view) => {
            const props = {
                view: view,
                setGPSOn: jest.fn(),
            };
            renderHook(() => useGeolocation(props));
            expect(geolocation.watchPosition).toBeCalledTimes(expected);
        });
    });
    it('should not watch position if geolocation is falsy', () => {
        getGeolocation.mockReturnValue(null);
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { result } = renderHook(() => useGeolocation(props));
        const state = result.current;
        expect(state.latLng).toBeFalsy();
    });
    it('should not clear watch if geolocation is falsy', () => {
        getGeolocation.mockReturnValue(null);
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { unmount } = renderHook(() => useGeolocation(props));
        unmount();
    });
    describe('highAccuracy', () => {
        const highAccuracyStates = [true, false];
        it.each(highAccuracyStates)('should set highAccuracy to %s', (expected) => {
            const props = {
                view: View.Waypoint_Read,
                highAccuracyGPS: expected,
                setGPSOn: jest.fn(),
            };
            renderHook(() => useGeolocation(props));
            expect(geolocation.watchPosition.mock.calls[0][2].enableHighAccuracy).toBe(expected);
        });
    });
    it('should show positions when success is called', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { result } = renderHook(() => useGeolocation(props));
        const successCallback = geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        const expected = { lat: 7, lng: -9 };
        const state = result.current;
        expect(state.latLng).toStrictEqual(expected);
    });
    it('should show positions when success is called', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { result } = renderHook(() => useGeolocation(props));
        const successCallback = geolocation.watchPosition.mock.calls[0][0];
        const expected = 20;
        await waitFor(() => successCallback({ coords: { accuracy: expected, } }));
        const state = result.current;
        expect(state.accuracy).toBe(expected);
    });
    it('should show last position when success is called', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { result } = renderHook(() => useGeolocation(props));
        const successCallback = geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            successCallback({ coords: { latitude: 1, longitude: 8, } });
        });
        const expected = { lat: 1, lng: 8 };
        const state = result.current;
        expect(state.latLng).toStrictEqual(expected);
    });
    it('should round position', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        renderHook(() => useGeolocation(props));
        const successCallback = geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        const expected = { lat: 7, lng: -9 };
        expect(roundLatLng).toBeCalledWith(expected);
    });
    it('should clear position when error occurs', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        const { result } = renderHook(() => useGeolocation(props));
        const [successCallback, errorCallback] = geolocation.watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        const state = result.current;
        expect(state.latLng).toBeFalsy();
    });
    it('should clear watch when error occurs', async () => {
        const props = {
            view: View.Waypoint_Read,
            setGPSOn: jest.fn(),
        };
        renderHook(() => useGeolocation(props));
        const [successCallback, errorCallback] = geolocation.watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        expect(geolocation.clearWatch).toBeCalledTimes(2); // 1 to start watch, 1 on error
    });
    describe('valid', () => {
        const validTests = [
            [{ clearWatch: jest.fn() }, true],
            [null, false],
        ];
        it.each(validTests)('should be valid when geolocation is %s: %s', (geolocation, expected) => {
            getGeolocation.mockReturnValue(geolocation);
            const props = {
                view: 'do not show latLng, but geolocation should still be valid',
                setGPSOn: jest.fn(),
            };
            const { result } = renderHook(() => useGeolocation(props));
            const state = result.current;
            expect(state.valid).toBe(expected);
        });
    });
    describe('setGPSOn', () => {
        it('should set GPS on', () => {
            const props = {
                view: View.Waypoint_Read,
                setGPSOn: jest.fn(),
            };
            renderHook(() => useGeolocation(props));
            expect(props.setGPSOn.mock.calls).toEqual([[false], [true]]); // stop before starting
        });
        it('should set GPS off', () => {
            const props = {
                view: View.Waypoint_Read,
                setGPSOn: jest.fn(),
            };
            const { unmount } = renderHook(() => useGeolocation(props));
            unmount();
            expect(props.setGPSOn.mock.calls).toEqual([[false], [true], [false]]); // stop before starting then stop when unmounting
        });
    });
});