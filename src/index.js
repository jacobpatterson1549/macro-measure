import React from "react";
import { createRoot } from "react-dom/client";

import './index.css';

import { App } from './components/App';
import { registerSW } from './serviceWorkerRegistration';
import { initDatabase } from './utils/Database';

window.addEventListener('load', async () => {
    await registerSW();
    const db = await initDatabase();
    const state = { db };

    const root = document.getElementById('root')
    const reactRoot = createRoot(root);
    reactRoot.render(<App {...state} />);
});
