import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import { ErrorBoundary } from './components/ErrorBoundary';
import { App } from './components/App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker.register(swURL)
      .then((swr) => console.log('service worker registered:', swr.scope))
      .catch((err) => console.log('service worker did not register:', err.message ? err.message : null));
  });
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);