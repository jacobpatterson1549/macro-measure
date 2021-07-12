import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import { useFullscreen, useOnLine, useInstallPromptEvent } from './Window';

import { isOnLine, addWindowEventListener } from '../utils/Global';

jest.mock('../utils/Global', () => ({
    isOnLine: jest.fn(),
    addWindowEventListener: jest.fn(),
    removeWindowEventListener: jest.fn(),
}));

describe('Window', () => {
    describe('fullscreen', () => {
        const tests = [
            [true, {}],
            [false, null],
        ];
        it.each(tests)('should initially be fullscreen=%s', (initial, initialFullscreenElement) => {
            document.fullscreenElement = initialFullscreenElement;
            const { result } = renderHook(() => useFullscreen());
            const [fullscreen, setFullscreen] = result.current;
            expect(fullscreen).toBe(initial);
        });
        it.each(tests)('should transition to fullscreen=%s', async (transition, transitionFullscreenElement) => {
            const { result } = renderHook(() => useFullscreen());
            document.fullscreenElement = transitionFullscreenElement;
            expect(addWindowEventListener.mock.calls[0][0]).toBe('fullscreenchange');
            const fullscreenChangeHandler = addWindowEventListener.mock.calls[0][1];
            await waitFor(() => {
                fullscreenChangeHandler();
                const [fullscreen, setFullscreen] = result.current;
                expect(fullscreen).toBe(transition);
            });
        });
        it('should request fullscreen when set to true', () => {
            document.body.requestFullscreen = jest.fn();
            const { result } = renderHook(() => useFullscreen());
            const [fullscreen, setFullscreen] = result.current;
            setFullscreen(true);
            expect(document.body.requestFullscreen).toBeCalled();
        });
        it('should exit fullscreen when set to false', () => {
            document.exitFullscreen = jest.fn();
            const { result } = renderHook(() => useFullscreen());
            const [fullscreen, setFullscreen] = result.current;
            setFullscreen(false);
            expect(document.exitFullscreen).toBeCalled();
        });
    });
    describe('onLine', () => {
        const tests = [
            [true, true, 'online', 0],
            [true, false, 'offline', 1],
            [false, true, 'online', 0],
            [false, false, 'offline', 1],
        ];
        it.each(tests)('should initially be onLine=%s then transition to onLine=%s when %s event is fired', async (initial, expected, eventName, eventIndex) => {
            isOnLine.mockReturnValueOnce(initial);
            const { result } = renderHook(() => useOnLine());
            const onLine = result.current;
            expect(onLine).toBe(initial);
            expect(addWindowEventListener.mock.calls[eventIndex][0]).toBe(eventName);
            const eventHandler = addWindowEventListener.mock.calls[eventIndex][1];
            await waitFor(() => {
                eventHandler();
                const onLine2 = result.current;
                expect(onLine2).toBe(expected);
            });
        });
    });
    describe('promptInstall', () => {
        const mockAndFireOnBeforeInstallPromptEvent = async () => {
            expect(addWindowEventListener.mock.calls[0][0]).toBe('beforeinstallprompt');
            const handlePreventDefault = addWindowEventListener.mock.calls[0][1];
            const event = {
                preventDefault: jest.fn(),
            };
            await waitFor(() => handlePreventDefault(event));
            return event;
        };
        it('should not have event when no beforeinstallprompt event is fired', () => {
            const { result } = renderHook(() => useInstallPromptEvent());
            const installPromptEvent = result.current;
            expect(installPromptEvent).toBeFalsy();
        });
        it('should have event when the event is fired', async () => {
            const { result } = renderHook(() => useInstallPromptEvent());
            await mockAndFireOnBeforeInstallPromptEvent();
            const installPromptEvent = result.current;
            expect(installPromptEvent).toBeTruthy();
        });
        it('should preventDefault when the event is fired', async () => {
            renderHook(() => useInstallPromptEvent());
            const event = await mockAndFireOnBeforeInstallPromptEvent();
            expect(event.preventDefault).toBeCalled();
        });
    });
});