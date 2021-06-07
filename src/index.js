import { render } from 'react-dom';

import './index.css';

import { register as registerSW } from './serviceWorkerRegistration';
import { App } from './components/App';

registerSW();
render(<App />, document.getElementById('root'));