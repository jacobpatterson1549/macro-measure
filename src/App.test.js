import { render, screen } from '@testing-library/react';

import { App } from './App';

test('has help header', () => {
  render(<App />);
  const linkElement = screen.getByText(/[?]/i);
  expect(linkElement).toBeInTheDocument();
});