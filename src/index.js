import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';
import { registerSW } from './serviceWorkerRegistration';
import { initDatabase } from './utils/db';

window.addEventListener('load', async () => {
    registerSW();
    initDatabase();
    render(
        <App />,
        document.getElementById('root'));
});