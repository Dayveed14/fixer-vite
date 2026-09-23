import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// Must be imported before any component that calls axios: it attaches
// the auth token to every request via a global interceptor.
import './config/axios';
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
