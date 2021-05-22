import { render, screen, fireEvent, createEvent, act } from '@testing-library/react';

import { FullscreenSettings } from './FullscreenSettings';

describe('fullscreen', () => {
    it('should be available if not currently active', () => {
        document.fullscreenEnabled = false;
        render(<FullscreenSettings />);
        const element = screen.getByLabelText(/Fullscreen/i);
        expect(element.checked).toBeFalsy();
    });
    it('should be exit-able if currently active', () => {
        document.fullscreenEnabled = true;
        render(<FullscreenSettings />);
        const element = screen.getByLabelText(/Fullscreen/i);
        expect(element.checked).toBeTruthy
    });
    // TODO: test clicking buttons
});

describe('add to home screen (a2hs)', () => {
    const asyncMockOnbeforeinstallprompt = async () => {
        // test procedure from https://github.com/testing-library/testing-library-docs/issues/798
        const event = createEvent('beforeinstallprompt', window);
        await act(async () => {
            Object.defineProperties(event, {
                preventDefault: { value: jest.fn() },
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