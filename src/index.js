import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { ErrorBoundary } from './ErrorBoundary';
import { App } from './App';

if (window.location.protocol !== 'https:') {
  window.location.protocol = 'https:';
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
