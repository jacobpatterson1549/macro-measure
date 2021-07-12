import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';
import { registerSW } from './serviceWorkerRegistration';
import { initDatabase } from './utils/Database';
import { addWindowEventListener, getElementById } from './utils/Global';

addWindowEventListener('load', async () => {
    await registerSW();
    await initDatabase();
    render(
        <App />,
        getElementById('root'));
});