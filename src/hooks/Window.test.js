import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import { useFullscreen, useOnLine, useInstallPromptEvent } from './Window';

import { isOnLine, addWindowEventListener, isFullscreen, requestFullscreen, exitFullscreen } from '../utils/Global';

describe('Window', () => {
    describe('fullscreen', () => {
        const tests = [
            [true],
            [false],
        ];
        it.each(tests)('should initially be fullscreen=%s', (expected) => {
            isFullscreen.mockReturnValue(expected);
            const { result } = renderHook(() => useFullscreen());
            const [fullscreen, _] = result.current;
            expect(fullscreen).toBe(expected);
        });
        it.each(tests)('should transition to fullscreen=%s', async (expected) => {
            isFullscreen.mockReturnValue(!expected);
            const { result } = renderHook(() => useFullscreen());
            const [fullscreen, _] = result.current;
            expect(fullscreen).toBe(!expected); // sanity check
            expect(addWindowEventListener.mock.calls[0][0]).toBe('fullscreenchange');
            const fullscreenChangeHandler = addWindowEventListener.mock.calls[0][1];
            await waitFor(() => {
                isFullscreen.mockReturnValue(expected);
                fullscreenChangeHandler();
                const [fullscreen, _] = result.current;
                expect(fullscreen).toBe(expected);
            });
        });
        const setterTests = [
            [requestFullscreen, true],
            [exitFullscreen, false],
        ];
        it.each(setterTests)('should exit fullscreen when set to false', (mock, requestedFullscreen) => {
            const { result } = renderHook(() => useFullscreen());
            const [_, setFullscreen] = result.current;
            setFullscreen(requestedFullscreen);
            expect(mock).toBeCalled();
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