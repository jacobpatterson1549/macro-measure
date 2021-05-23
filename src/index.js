import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { App } from './components/App';

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
