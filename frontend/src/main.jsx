// frontend/src/main.jsx
import React from 'react';
import { hydrateRoot } from 'react-dom/client'; // Import hydrateRoot
import './index.css';
import App from './App.jsx';
import { HelmetProvider } from 'react-helmet-async';

const container = document.getElementById('root');

// Use hydrateRoot to attach React to the pre-rendered HTML
hydrateRoot(
    container,
    <React.Fragment>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.Fragment>
);