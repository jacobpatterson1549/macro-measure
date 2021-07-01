import { StrictMode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Root } from './Root';

export const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>
);