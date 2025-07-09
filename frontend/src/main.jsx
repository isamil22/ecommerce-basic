import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);

// Render the App component without StrictMode to resolve the warning
root.render(
    <React.Fragment>
        <App />
    </React.Fragment>
);