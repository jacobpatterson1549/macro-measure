import { render, screen, waitFor } from '@testing-library/react';

import { FullscreenSettings } from './FullscreenSettings';

describe('FullscreenSettings', () => {
    describe('fullscreen', () => {
        describe('state', () => {
            it('should be available if not currently active', () => {
                render(<FullscreenSettings fullscreen={false} />);
                const element = screen.getByRole('checkbox');
                expect(element.checked).toBeFalsy();
            });
            it('should be exit-able if currently active', () => {
                render(<FullscreenSettings fullscreen={true} />);
                const element = screen.getByRole('checkbox');
                expect(element.checked).toBeTruthy();
            });
        });
        describe('click handlers', () => {
            it('should request fullscreen when clicked', async () => {
                const root = (<FullscreenSettings />);
                document.fullscreenElement = null;
                document.body.requestFullscreen = jest.fn().mockReturnValue(() => { });
                render(root);
                const element = screen.getByRole('checkbox');
                element.click();
                expect(document.body.requestFullscreen).toBeCalled();
            });
            it('should cancel fullscreen when clicked', () => {
                const root = (<FullscreenSettings fullscreen={true} />);
                document.fullscreenElement = root;
                document.exitFullscreen = jest.fn();
                render(root);
                const element = screen.getByRole('checkbox');
                element.click();
                expect(document.exitFullscreen).toBeCalled();
            });
        });
    });
    describe('add to home screen (a2hs)', () => {
        describe('state', () => {
            it('should show install button when is truthy', () => {
                render(<FullscreenSettings installPromptEvent={{}} />);
                expect(screen.queryByRole('button', { name: 'Install' })).toBeInTheDocument();
                expect(screen.queryByText(/^online/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/^offline/i)).not.toBeInTheDocument();
            });
            it('should show reload root button when is installed and online', () => {
                render(<FullscreenSettings onLine={true} />);
                expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
                expect(screen.queryByText(/^online/i)).toBeInTheDocument();
                expect(screen.queryByText(/^offline/i)).not.toBeInTheDocument();
            });
            it('should show prompt to go online when is installed and is not online', () => {
                render(<FullscreenSettings onLine={false} />);
                expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
                expect(screen.queryByText(/^online/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/^offline/i)).toBeInTheDocument();
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
                render(<FullscreenSettings installPromptEvent={installPromptEvent} />);
                const element = screen.queryByRole('button');
                element.click();
                await waitFor(expect(installPromptEvent.prompt).toBeCalled);
                expect(window.location.reload).toBeCalledTimes(expected);
            });
        });
    });
});