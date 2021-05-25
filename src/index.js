import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { App } from './components/App';
import * as serviceWorker from './serviceWorkerRegistration';

serviceWorker.checkProtocol();
serviceWorker.register();

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