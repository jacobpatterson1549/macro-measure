import { render } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
    test('renders and unmounts without error', () => {
        const { unmount } = render(<App />);
        unmount();
    });
});