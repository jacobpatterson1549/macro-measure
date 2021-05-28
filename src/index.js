import ReactDOM from 'react-dom';

import './index.css';

import { App } from './components/App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swURL = `${process.env.PUBLIC_URL}/service-worker.js`;
    navigator.serviceWorker.register(swURL);
  });
}

ReactDOM.render(<App />, document.getElementById('root'));