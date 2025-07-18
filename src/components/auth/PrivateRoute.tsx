import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export function PrivateRoute({ children }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // 🔥 KEY FIX: Show loading spinner while auth is initializing
  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, redirect to auth page with return URL
  if (!session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}

// PublicRoute.tsx
export function PublicRoute({ children }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // 🔥 KEY FIX: Show loading spinner while auth is initializing  
  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, redirect to dashboard (or return URL)
  if (session) {
    // Check if there's a return URL from the login redirect
    const from = (location.state as any)?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, render public content
  return <>{children}</>;
}