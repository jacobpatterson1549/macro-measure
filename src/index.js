import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { App } from './components/App';
import * as serviceWorker from './serviceWorkerRegistration';

serviceWorker.checkProtocol();
serviceWorker.register();

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);