import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { initializeSupabase } from './lib/supabase';

// Import Layouts and Auth Components
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PrivateRoute';

// Import All Page Components
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { Legal } from './pages/Legal';
import { HelpCenter } from './pages/docs/HelpCenter';
import { Auth } from './pages/Auth';
import { CompleteSignup } from './pages/auth/CompleteSignup';
import { Dashboard } from './pages/Dashboard';
import { MortgageClients } from './pages/MortgageClients';
import { RateTracking } from './pages/RateTracking';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Billing } from './pages/Billing';
import { Careers } from './pages/Careers';
import { Guides } from './pages/Guides';
import { SystemStatus } from './pages/SystemStatus';
import { Security } from './pages/Security';
import { CookiePolicy } from './pages/CookiePolicy';
import { NotFound } from './pages/NotFound';
import { PostSignupBilling } from './pages/PostSignupBilling'; // Add this import

// Define the router configuration
const router = createBrowserRouter(
  [
    {
      element: <App />, // App.tsx is the root layout
      children: [
        // Public routes
        { path: '/', element: <Landing /> },
        { path: '/features', element: <Features /> },
        { path: '/pricing', element: <Pricing /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/blog', element: <Blog /> },
        { path: '/privacy', element: <Legal /> },
        { path: '/terms', element: <Legal /> },
        { path: '/help', element: <HelpCenter /> },
        { path: '/careers', element: <Careers /> },
        { path: '/guides', element: <Guides /> },
        { path: '/status', element: <SystemStatus /> },
        { path: '/security', element: <Security /> },
        { path: '/post-signup-billing', element: <PostSignupBilling /> },
        { path: '/cookies', element: <CookiePolicy /> },
        { path: '/auth', element: <PublicRoute><Auth /></PublicRoute> },
        { path: '/complete-signup', element: <CompleteSignup /> },
        

        // Protected routes
        {
          path: '/dashboard',
          element: <PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>
        },
        {
          path: '/mortgage-clients',
          element: <PrivateRoute><DashboardLayout><MortgageClients /></DashboardLayout></PrivateRoute>
        },
        {
          path: '/rates',
          element: <PrivateRoute><DashboardLayout><RateTracking /></DashboardLayout></PrivateRoute>
        },
        {
          path: '/notifications',
          element: <PrivateRoute><DashboardLayout><Notifications /></DashboardLayout></PrivateRoute>
        },
        {
          path: '/settings',
          element: <PrivateRoute><DashboardLayout><Settings /></DashboardLayout></PrivateRoute>
        },
        {
          path: '/billing',
          element: <PrivateRoute><DashboardLayout><Billing /></DashboardLayout></PrivateRoute>
        },

        // 404 Page
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    // Fixes the console warnings and opts into modern router behavior
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
          <RouterProvider router={router} />
        </AuthProvider>
      </HelmetProvider>
    </StrictMode>
  );
}).catch(error => {
  console.error('Failed to initialize application', error);
});