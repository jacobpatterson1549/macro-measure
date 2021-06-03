import { render, screen, waitFor } from '@testing-library/react';

import { Geolocation } from './Geolocation';

import { roundLatLng } from '../utils/Geolocation';
import { View } from '../utils/View';

jest.mock('../utils/Geolocation');

beforeEach(() => {
    roundLatLng.mockImplementation((latLng) => latLng);
});

describe('Geolocation', () => {
    let oldGeolocation;
    beforeEach(() => {
        oldGeolocation = navigator.geolocation;
    });
    afterEach(() => {
        navigator.geolocation = oldGeolocation;
    });
    const MockApp = ({ position: geolocation }) => (
        <div>
            {
                geolocation.latLng &&
                <p title="position">[{geolocation.latLng.lat},{geolocation.latLng.lng}]</p>
            }
            <p title="valid">{String(geolocation.valid)}</p>
        </div>
    );
    describe('views', () => {
        const viewTests = [
            [1, View.Item_Create],
            [1, View.Item_Read],
            [0, View.Item_Update],
            [0, View.Item_Delete],
            [0, View.Item_Read_List],
        ];
        it.each(viewTests)('should watch position %d times when view is %s', (expected, view) => {
            navigator.geolocation.watchPosition = jest.fn();
            render(<Geolocation
                view={view}
                setGPSOn={jest.fn()}
                render={position => <MockApp position={position} />}
            />);
            expect(navigator.geolocation.watchPosition).toBeCalledTimes(expected);
        });
    });
    it('should not watch position if geolocation is falsy', () => {
        navigator.geolocation = null; // will crash if watchPosition is called
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const element = screen.queryByTitle('position');
        expect(element).not.toBeInTheDocument();
    });
    it('should not clear watch if geolocation is falsy', () => {
        navigator.geolocation = null; // will crash if watchPosition is called
        const { unmount } = render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        unmount();
    });
    describe('highAccuracy', () => {
        const highAccuracyStates = [true, false];
        it.each(highAccuracyStates)('should set highAccuracy to %s', (state) => {
            render(<Geolocation
                view={View.Item_Read}
                highAccuracyGPS={state}
                setGPSOn={jest.fn()}
                render={position => <MockApp position={position} />}
            />);
            expect(navigator.geolocation.watchPosition.mock.calls[0][2].enableHighAccuracy).toBe(state);
        });
    });
    it('should show positions when success is called', async () => {
        navigator.geolocation.watchPosition = jest.fn();
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        expect(screen.queryByTitle('position').textContent).toBe("[7,-9]");
    });
    it('should show last position when success is called', async () => {
        navigator.geolocation.watchPosition = jest.fn();
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            successCallback({ coords: { latitude: 1, longitude: 8, } });
        });
        expect(screen.queryByTitle('position').textContent).toBe("[1,8]");
    });
    it('should round position', async () => {
        jest.mock()
        navigator.geolocation.watchPosition = jest.fn();
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
        await waitFor(() => successCallback({ coords: { latitude: 7, longitude: -9, } }));
        expect(roundLatLng).toBeCalledWith({ lat: 7, lng: -9 });
    });
    it('should clear position when error occurs', async () => {
        navigator.geolocation.watchPosition = jest.fn();
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const [successCallback, errorCallback] = navigator.geolocation.watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        expect(screen.queryByTitle('position')).not.toBeInTheDocument();
    });
    it('should clear watch when error occurs', async () => {
        navigator.geolocation = {
            watchPosition: jest.fn(),
            clearWatch: jest.fn(),
        };
        render(<Geolocation
            view={View.Item_Read}
            setGPSOn={jest.fn()}
            render={position => <MockApp position={position} />}
        />);
        const [successCallback, errorCallback] = navigator.geolocation.watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        expect(navigator.geolocation.clearWatch).toBeCalledTimes(2); // 1 to start watch, 1 on error
    });
    describe('valid', () => {
        const validTests = [
            [{ clearWatch: jest.fn() }, true],
            [null, false],
        ];
        it.each(validTests)('should be valid when geolocation is %s: %s', (geolocation, expected) => {
            navigator.geolocation = geolocation;
            render(<Geolocation
                view={'do not show latLng, but geolocation should still be valid'}
                setGPSOn={jest.fn()}
                render={position => <MockApp position={position} />}
            />);
            const element = screen.queryByTitle('valid');
            expect(element.textContent).toBe(String(expected));
        });
    });
    describe('setGPSOn', () => {
        it('should set GPS on', () => {
            const setGPSOn = jest.fn();
            navigator.geolocation.watchPosition = jest.fn();
            render(<Geolocation
                view={View.Item_Read}
                setGPSOn={setGPSOn}
                render={position => <MockApp position={position} />}
            />);
            const successCallback = navigator.geolocation.watchPosition.mock.calls[0][0];
            expect(setGPSOn.mock.calls).toEqual([[false], [true]]); // stop before starting
        });
        it('should set GPS off', () => {
            const setGPSOn = jest.fn();
            const { unmount } = render(<Geolocation
                view={View.Item_Read}
                setGPSOn={setGPSOn}
                render={position => <MockApp position={position} />}
            />);
            unmount();
            expect(setGPSOn.mock.calls).toEqual([[false], [true], [false]]); // stop before starting then stop when unmounting
        });
    });
});