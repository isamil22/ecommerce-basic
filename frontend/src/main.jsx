// frontend/src/main.jsx
import React from 'react';
import { hydrateRoot } from 'react-dom/client'; // 1. Import hydrateRoot
import './index.css';
import App from './App.jsx';
import { HelmetProvider } from 'react-helmet-async';

const container = document.getElementById('root');

// 2. Use hydrateRoot instead of createRoot().render()
hydrateRoot(
    container,
    <React.Fragment>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.Fragment>
);