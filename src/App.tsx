import { Routes, Route, Navigate } from 'react-router-dom';
import { Head } from './components/Head';
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
import { PublicRoute } from './components/auth/PrivateRoute';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Careers } from './pages/Careers';
import { Guides } from './pages/Guides';
import { SystemStatus } from './pages/SystemStatus';
import { Security } from './pages/Security';
import { CookiePolicy } from './pages/CookiePolicy';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <>
      <Head />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/status" element={<SystemStatus />} />
        <Route path="/security" element={<Security />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/auth/complete-signup" element={<PublicRoute><CompleteSignup /></PublicRoute>} />

        {/* Protected routes with DashboardLayout */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/mortgage-clients" element={
          <PrivateRoute>
            <DashboardLayout>
              <MortgageClients />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/rates" element={
          <PrivateRoute>
            <DashboardLayout>
              <RateTracking />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/billing" element={
          <PrivateRoute>
            <DashboardLayout>
              <Billing />
            </DashboardLayout>
          </PrivateRoute>
        } />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}