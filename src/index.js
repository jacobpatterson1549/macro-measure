import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker.register(swURL);
  });
}

render(<App />, document.getElementById('root'));