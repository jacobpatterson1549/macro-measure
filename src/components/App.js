import { StrictMode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Root } from './Root';

export const App = (props) => (
  <StrictMode>
    <ErrorBoundary {...props} >
      <Root {...props} />
    </ErrorBoundary>
  </StrictMode>
);