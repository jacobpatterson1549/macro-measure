import { StrictMode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Window } from './Window';
import { Root } from './Root';

export const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <Window render={props => (
        <Root {...props} />
      )} />
    </ErrorBoundary>
  </StrictMode>
);