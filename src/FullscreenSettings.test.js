import { render, screen } from '@testing-library/react';

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
    // TODO: click buttons
});

// TODO: have install app button