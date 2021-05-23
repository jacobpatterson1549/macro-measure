import { render, screen, fireEvent, createEvent, waitFor, act } from '@testing-library/react';

import { FullscreenSettings } from './FullscreenSettings';

describe('fullscreen', () => {
    describe('state', () => {
        it('should be available if not currently active', () => {
            const root = (<FullscreenSettings />);
            document.fullscreenElement = null;
            render(root);
            const element = screen.getByRole('checkbox', { name: 'Fullscreen:' });
            expect(element.checked).toBeFalsy();
        });
        it('should be exit-able if currently active', () => {
            const root = (<FullscreenSettings />);
            document.fullscreenElement = root;
            render(root);
            const element = screen.getByRole('checkbox', { name: 'Fullscreen:' });
            expect(element.checked).toBeTruthy();
        });
    });
    describe('click handlers', () => {
        it('should request fullscreen when clicked', async () => {
            const root = (<FullscreenSettings />);
            document.fullscreenElement = null;
            document.body.requestFullscreen = jest.fn().mockReturnValue(() => { });
            render(root);
            const element = screen.getByRole('checkbox', { name: 'Fullscreen:' });
            fireEvent.click(element);
            expect(element.checked).toBeFalsy(); // should not set checked until resolved
            await waitFor(expect(document.body.requestFullscreen).toBeCalled);
            expect(element.checked).toBeTruthy();
        });
        it('should cancel fullscreen when clicked', () => {
            const root = (<FullscreenSettings />);
            document.fullscreenElement = root;
            document.exitFullscreen = jest.fn();
            render(root);
            const element = screen.getByRole('checkbox', { name: 'Fullscreen:' });
            fireEvent.click(element);
            expect(document.exitFullscreen).toBeCalled();
            expect(element.checked).toBeFalsy();
        });
    });
});

describe('add to home screen (a2hs)', () => {
    const asyncMockOnbeforeinstallprompt = async (accepted) => {
        // test procedure from https://github.com/testing-library/testing-library-docs/issues/798
        const event = createEvent('beforeinstallprompt', window);
        await act(async () => {
            Object.defineProperties(event, {
                preventDefault: { value: jest.fn() },
                userChoice: { value: jest.fn().mockResolvedValue({ outcome: accepted }) },
                prompt: { value: jest.fn() },
            });
            fireEvent(window, event);
        });
        return event
    };
    describe('state', () => {
        it('should show install button when onbeforeinstallprompt is fired and prompt when clicked', async () => {
            render(<FullscreenSettings />);
            const event = await asyncMockOnbeforeinstallprompt();
            expect(screen.queryByRole('button', { name: 'Install' })).toBeInTheDocument();
            expect(screen.queryByText(/go online/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
            expect(event.preventDefault).toBeCalled();
        });
        it('should show reload root button when is installed and online', () => {
            window.navigator.onLine = true;
            render(<FullscreenSettings />);
            expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
            expect(screen.queryByText(/go online/i)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reload' })).toBeInTheDocument();
        });
        it('should show prompt to go online when is installed and is not online', () => {
            window.navigator.onLine = false;
            render(<FullscreenSettings />);
            expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
            expect(screen.queryByText(/go online/i)).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
        });
    });
    describe('click handlers', () => {
        it('should show install button when onbeforeinstallprompt is fired and prompt when clicked', async () => {
            render(<FullscreenSettings />);
            const event = await asyncMockOnbeforeinstallprompt();
            const element = screen.getByRole('button', { name: 'Install' });
            element.click();
            expect(event.prompt).toBeCalled();
        });
        it('should show reload button when user accepts install request', async () => {
            window.navigator.onLine = true;
            render(<FullscreenSettings />);
            await asyncMockOnbeforeinstallprompt('accepted');
            const element = screen.getByRole('button', { name: 'Install' });
            await waitFor(() => fireEvent.click(element));
            expect(screen.queryByRole('button', { name: 'Install' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reload' })).toBeInTheDocument();
        });
        it('should not change state when user rejects install request', async () => {
            render(<FullscreenSettings />);
            await asyncMockOnbeforeinstallprompt('anything other than "accepted", normally "dismissed"');
            const element = screen.getByRole('button', { name: 'Install' });
            await waitFor(() => fireEvent.click(element));
            expect(screen.queryByRole('button', { name: 'Install' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
        });
        it('should redirect to root when reload app is clicked', () => {
            window.navigator.onLine = true;
            window.location = '/?pwa=true';
            render(<FullscreenSettings />);
            expect(window.location).not.toBe('/');
            const element = screen.getByLabelText(/reload/i);
            fireEvent.click(element);
            expect(window.location).toBe('/');
        });
    });
});