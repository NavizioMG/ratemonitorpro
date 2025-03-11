import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { initializeSupabase } from './lib/supabase';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Initialize the app
console.info('Application initialization started');

initializeSupabase().then((success) => {
  console.info('Supabase initialization completed', { success });
  
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
}).catch(error => {
  console.error('Failed to initialize application', error);
});