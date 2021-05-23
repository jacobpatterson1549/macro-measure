import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('should have help header in the document', () => {
    render(<App />);
    const linkElement = screen.getByText(/[?]/i);
    expect(linkElement).toBeInTheDocument();
  });
});