// frontend/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HelmetProvider } from 'react-helmet-async'; // <-- ADD THIS LINE

const container = document.getElementById('root');
const root = createRoot(container);

// Render the App component without StrictMode to resolve the warning
root.render(
    <React.Fragment>
        <HelmetProvider> {/* <-- WRAP YOUR APP */}
            <App />
        </HelmetProvider>
    </React.Fragment>
);