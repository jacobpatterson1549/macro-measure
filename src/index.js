import { render } from 'react-dom';

import './index.css';

import { App } from './components/App';

require('./serviceWorkerRegistration');

render(
    <App />,
    document.getElementById('root'));