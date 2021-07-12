import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';
import { registerSW } from './serviceWorkerRegistration';
import { initDatabase } from './utils/Database';

window.addEventListener('load', async () => {
    await registerSW();
    await initDatabase();
    render(
        <App />,
        document.getElementById('root'));
});