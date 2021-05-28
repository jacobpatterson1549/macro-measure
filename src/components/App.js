import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { Window } from './Window';
import { Root } from './Root';

export const App = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <Window render={props => (
        <Root {...props} />
      )} />
    </ErrorBoundary>
  </React.StrictMode>
);