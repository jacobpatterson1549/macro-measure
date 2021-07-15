import { render, screen, waitFor } from '@testing-library/react';

import { FullscreenSettings } from './FullscreenSettings';

import { useFullscreen, useOnLine, useInstallPromptEvent } from '../hooks/Window';

import { reloadWindow } from '../utils/Global';

jest.mock('../hooks/Window');

describe('FullscreenSettings', () => {
    beforeEach(() => {
        useFullscreen.mockReturnValue([]);
    })
    describe('fullscreen', () => {
        describe('state', () => {
            it('should be available if not currently active', () => {
                useFullscreen.mockReturnValue([false]);
                render(<FullscreenSettings />);
                const element = screen.getByRole('checkbox');
                expect(element.checked).toBeFalsy();
            });
            it('should be exit-able if currently active', () => {
                useFullscreen.mockReturnValue([true]);
                render(<FullscreenSettings />);
                const element = screen.getByRole('checkbox');
                expect(element.checked).toBeTruthy();
            });
        });
        describe('click handlers', () => {
            it('should request fullscreen when clicked', async () => {
                const setFullscreen = jest.fn();
                useFullscreen.mockReturnValue([false, setFullscreen]);
                render(<FullscreenSettings />);
                const element = screen.getByRole('checkbox');
                element.click();
                expect(setFullscreen).toBeCalledWith(true);
            });
            it('should cancel fullscreen when clicked', () => {
                const setFullscreen = jest.fn();
                useFullscreen.mockReturnValue([true, setFullscreen]);
                render(<FullscreenSettings />);
                const element = screen.getByRole('checkbox');
                element.click();
                expect(setFullscreen).toBeCalledWith(false);
            });
        });
    });
    describe('add to home screen (a2hs)', () => {
        describe('state', () => {
            it('should show install button when is truthy', () => {
                useInstallPromptEvent.mockReturnValue({});
                render(<FullscreenSettings />);
                expect(screen.queryByRole('button', { name: 'Install' })).toBeInTheDocument();
                expect(screen.queryByText(/^online/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/^offline/i)).not.toBeInTheDocument();
            });
            it('should show reload root button when is installed and online', () => {
                useOnLine.mockReturnValue(true);
                render(<FullscreenSettings />);
                expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
                expect(screen.queryByText(/online/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
            });
            it('should show prompt to go online when is installed and is not online', () => {
                useOnLine.mockReturnValue(false);
                render(<FullscreenSettings />);
                expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
                expect(screen.queryByText(/online/i)).toBeInTheDocument();
                expect(screen.queryByText(/offline/i)).toBeInTheDocument();
            });
        });
        describe('click handlers', () => {
            const acceptedTests = [
                [1, 'accepted'],
                [0, 'dismissed'],
                [0, 'not'],
                [0, null],
            ]
            it.each(acceptedTests)('should reload %d times when choiceResult of install prompt is "%s"', async (expected, accepted) => {
                const installPromptEvent = {
                    prompt: jest.fn(),
                    userChoice: { outcome: accepted },
                };
                useInstallPromptEvent.mockReturnValue(installPromptEvent);
                render(<FullscreenSettings />);
                const element = screen.queryByRole('button');
                element.click();
                await waitFor(expect(installPromptEvent.prompt).toBeCalled);
                expect(reloadWindow).toBeCalledTimes(expected);
            });
        });
    });
});