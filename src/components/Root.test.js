import { render, screen } from '@testing-library/react';

import { Root } from './Root';

describe('Root', () => {
  it('should have help header in the document', () => {
    render(<Root />);
    const linkElement = screen.getByText(/[?]/i);
    expect(linkElement).toBeInTheDocument();
  });
});