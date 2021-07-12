import { fireEvent, createEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks'

import { useFullscreen, useOnLine, useInstallPromptEvent } from './Window';

import { isOnLine } from '../utils/Global';

jest.mock('../utils/Global', () => ({
    isOnLine: jest.fn(),
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
        it.each(tests)('should transition to fullscreen=%s', (transition, transitionFullscreenElement) => {
            const { result } = renderHook(() => useFullscreen());
            document.fullscreenElement = transitionFullscreenElement;
            const event = createEvent('fullscreenchange', window);
            fireEvent(window, event);
            const [fullscreen, setFullscreen] = result.current;
            expect(fullscreen).toBe(transition);
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
            [true, true, 'online'],
            [true, false, 'offline'],
            [false, true, 'online'],
            [false, false, 'offline'],
        ];
        it.each(tests)('should initially be onLine=%s then transition to onLine=%s when %s event is fired', (initial, expected, eventName) => {
            isOnLine.mockReturnValueOnce(initial);
            const { result } = renderHook(() => useOnLine());
            const onLine = result.current;
            expect(onLine).toBe(initial);
            const event = createEvent(eventName, window);
            fireEvent(window, event);
            const onLine2 = result.current;
            expect(onLine2).toBe(expected);
        });
    });
    describe('promptInstall', () => {
        const mockAndFireOnBeforeInstallPromptEvent = () => {
            // test procedure from https://github.com/testing-library/testing-library-docs/issues/798
            const event = createEvent('beforeinstallprompt', window);
            Object.defineProperty(event, 'preventDefault', { value: jest.fn() });
            fireEvent(window, event);
            return event
        };
        it('should not have event when no beforeinstallprompt event is fired', () => {
            const { result } = renderHook(() => useInstallPromptEvent());
            const installPromptEvent = result.current;
            expect(installPromptEvent).toBeFalsy();
        });
        it('should have event when the event is fired', () => {
            const { result } = renderHook(() => useInstallPromptEvent());
            mockAndFireOnBeforeInstallPromptEvent();
            const installPromptEvent = result.current;
            expect(installPromptEvent).toBeTruthy();
        });
        it('should preventDefault when the event is fired', () => {
            renderHook(() => useInstallPromptEvent());
            const event = mockAndFireOnBeforeInstallPromptEvent();
            expect(event.preventDefault).toBeCalled();
        });
    });
});