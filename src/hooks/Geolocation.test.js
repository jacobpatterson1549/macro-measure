import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import { useGeolocation } from './Geolocation';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';
import { getGeolocation } from '../utils/Global';

jest.mock('../utils/Geolocation');

describe('Geolocation', () => {
    beforeEach(() => {
        roundLatLng.mockImplementation((latLng) => latLng);
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
            renderHook(() => useGeolocation(view, false, jest.fn()));
            expect(getGeolocation().watchPosition).toBeCalledTimes(expected);
        });
    });
    it('should not watch position if geolocation is falsy', () => {
        getGeolocation.mockReturnValue(null);
        const { result } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const state = result.current;
        expect(state.lat).toBeFalsy();
        expect(state.lng).toBeFalsy();
    });
    it('should not clear watch if geolocation is falsy', () => {
        getGeolocation.mockReturnValue(null);
        const { unmount } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        unmount();
    });
    describe('highAccuracy', () => {
        const highAccuracyStates = [true, false];
        it.each(highAccuracyStates)('should set highAccuracy to %s', (expected) => {
            renderHook(() => useGeolocation(View.Waypoint_Read, expected, jest.fn()));
            expect(getGeolocation().watchPosition.mock.calls[0][2].enableHighAccuracy).toBe(expected);
        });
    });
    it('should show positions when success is called', async () => {
        const { result } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const successCallback = getGeolocation().watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        const state = result.current;
        expect(state.lat).toBe(7);
        expect(state.lng).toBe(-9);
    });
    it('should show positions when success is called', async () => {
        const { result } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const successCallback = getGeolocation().watchPosition.mock.calls[0][0];
        const expected = 20;
        await waitFor(() => successCallback({ coords: { accuracy: expected, } }));
        const state = result.current;
        expect(state.accuracy).toBe(expected);
    });
    it('should show last position when success is called', async () => {
        const { result } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const successCallback = getGeolocation().watchPosition.mock.calls[0][0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            successCallback({ coords: { latitude: 1, longitude: 8, } });
        });
        const state = result.current;
        expect(state.lat).toBe(1);
        expect(state.lng).toBe(8);
    });
    it('should round position', async () => {
        renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const successCallback = getGeolocation().watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        const expected = { lat: 7, lng: -9 };
        expect(roundLatLng).toBeCalledWith(expected);
    });
    it('should clear position when error occurs', async () => {
        const { result } = renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const [successCallback, errorCallback] = getGeolocation().watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        const state = result.current;
        expect(state.lat).toBeFalsy();
        expect(state.lng).toBeFalsy();
    });
    it('should clear watch when error occurs', async () => {
        renderHook(() => useGeolocation(View.Waypoint_Read, false, jest.fn()));
        const [successCallback, errorCallback] = getGeolocation().watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        expect(getGeolocation().clearWatch).toBeCalledTimes(2); // 1 to start watch, 1 on error
    });
    describe('valid', () => {
        const validTests = [
            [{ clearWatch: jest.fn() }, true],
            [null, false],
        ];
        it.each(validTests)('should be valid when geolocation is %s: %s', (geolocation, expected) => {
            getGeolocation.mockReturnValue(geolocation);
            const { result } = renderHook(() => useGeolocation(View.About, false, jest.fn()));
            const state = result.current;
            expect(state.valid).toBe(expected);
        });
    });
    describe('setGPSOn', () => {
        it('should set GPS on', () => {
            const setGPSOn = jest.fn();
            renderHook(() => useGeolocation(View.Waypoint_Read, false, setGPSOn));
            expect(setGPSOn.mock.calls).toEqual([[false], [true]]); // stop before starting
        });
        it('should set GPS off', () => {
            const setGPSOn = jest.fn();
            const { unmount } = renderHook(() => useGeolocation(View.Waypoint_Read, false, setGPSOn));
            unmount();
            expect(setGPSOn.mock.calls).toEqual([[false], [true], [false]]); // stop before starting then stop when unmounting
        });
    });
});