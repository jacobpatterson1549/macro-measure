import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';
import { registerSW } from './serviceWorkerRegistration';
import { initDatabase } from './utils/Database';

window.addEventListener('load', async () => {
    await registerSW();
    const db = await initDatabase();
    const state = { db };
    render(
        <App {...state} />,
        document.getElementById('root'));
});