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
    const MockApp = ({ position: geolocation }) => {
        return (
            <div>
                {
                    geolocation.latLng &&
                    <p title="position">[{geolocation.latLng.lat},{geolocation.latLng.lng}]</p>
                }
                <p title="valid">{String(geolocation.valid)}</p>
            </div>
        )
    };
    describe('views', () => {
        const viewTests = [
            [View.Item_Create, true],
            [View.Item_Read, true],
            [View.Item_Update, false],
            [View.Item_Delete, false],
            [View.Items_Read, false],
        ];
        it.each(viewTests)('should watch position when view is %s: %s', (view, expected) => {
            navigator.geolocation.watchPosition = jest.fn();
            render(<Geolocation
                view={view}
                render={position => <MockApp position={position} />}
            />);
            expect(navigator.geolocation.watchPosition).toBeCalledTimes(expected ? 1 : 0);
        });
    });
    it('should not watch position if geolocation is falsy', () => {
        navigator.geolocation = null; // will crash if watchPosition is called
        render(<Geolocation
            view={View.Item_Read}
            render={position => <MockApp position={position} />}
        />);
        const element = screen.queryByTitle('position');
        expect(element).not.toBeInTheDocument();
    });
    describe('highAccuracy', () => {
        const highAccuracyStates = [true, false];
        it.each(highAccuracyStates)('should set highAccuracy to %s', (state) => {
            render(<Geolocation
                view={View.Item_Read}
                highAccuracyGPS={state}
                render={position => <MockApp position={position} />}
            />);
            expect(navigator.geolocation.watchPosition.mock.calls[0][2].enableHighAccuracy).toBe(state);
        });
    });
    it('should show positions when success is called', async () => {
        navigator.geolocation.watchPosition = jest.fn();
        render(<Geolocation
            view={View.Item_Read}
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
            render={position => <MockApp position={position} />}
        />);
        const [successCallback, errorCallback] = navigator.geolocation.watchPosition.mock.calls[0];
        await waitFor(() => {
            successCallback({ coords: { latitude: 7, longitude: -9, } });
            errorCallback({ message: 'unavailable', code: 2 });
        });
        expect(screen.queryByTitle('position')).not.toBeInTheDocument();
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
                render={position => <MockApp position={position} />}
            />);
            const element = screen.queryByTitle('valid');
            expect(element.textContent).toBe(String(expected));
        });
    });
});