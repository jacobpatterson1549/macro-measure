import { render, screen } from '@testing-library/react';

import { App } from './App';

import { View } from '../utils/View';

describe('App', () => {
  it('should have help header in the document', () => {
    render(<App />);
    const linkElement = screen.getByText(/[?]/i);
    expect(linkElement).toBeInTheDocument();
  });

  describe('views', () => {
    it.each(Object.entries(View))('should render with view %s', (name, view) => {
      window.localStorage.getItem.mockImplementation((key) => key === 'view' ? `"${view}"` : null);
      render(<App />);
    });
  });
});