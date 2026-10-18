import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// All backend calls go through src/api/client.js (base URL, cookies,
// CSRF header, timeouts, error normalisation).
import './App.css';
import App from './App';
import ErrorBoundary from './components/components/ErrorBoundary';
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary fullPage>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </ErrorBoundary>
);
