import { render } from '@testing-library/react';

import { App } from './App';

import { useItem, useItems } from '../hooks/Database';

jest.mock('../hooks/Database');

describe('App', () => {
    beforeEach(() => {
        useItem.mockReturnValue([]);
        useItems.mockReturnValue([]);
    });
    test('renders and unmounts without error', () => {
        const { unmount } = render(<App />);
        unmount();
    });
});