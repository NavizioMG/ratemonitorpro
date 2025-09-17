// src/main.tsx (Updated)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // 👈 Import new components
import { App } from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { initializeSupabase } from './lib/supabase';

// Import all your page/component routes
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
// ... import ALL other pages used in your routes

// 👇 Define routes as an object array
const router = createBrowserRouter(
  [
    {
      element: <App />, // App is now the layout component
      children: [
        { path: "/", element: <Landing /> },
        { path: "/features", element: <Features /> },
        { path: "/pricing", element: <Pricing /> },
        // ... add ALL your other public and private routes here in this object format
        // Example for a protected route:
        { 
          path: "/dashboard", 
          element: (
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          )
        },
        // Make sure to include your 404 page
        { path: "*", element: <NotFound /> }
      ]
    }
  ],
  // 👇 Add the future flags here to fix the warnings
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

initializeSupabase().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <AuthProvider>
          {/* 👇 Use the new RouterProvider */}
          <RouterProvider router={router} />
        </AuthProvider>
      </HelmetProvider>
    </StrictMode>
  );
}).catch(error => {
  // This is a critical error log for startup failure, it's good to keep it.
  console.error('Failed to initialize application', error);
});