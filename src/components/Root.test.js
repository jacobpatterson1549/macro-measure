import { render, screen } from '@testing-library/react';

import { Root } from './Root';

describe('Root', () => {
  it('should have help header in the document', () => {
    render(<Root />);
    const linkElement = screen.getByText('?');
    expect(linkElement).toBeInTheDocument();
  });
  it('should default gpsOn to false', () => {
    render(<Root />);
    const element = screen.getByText((content, element) => (
      element.textContent === 'GPS: OFF'
    ));
    expect(element).toBeInTheDocument();
  });
});