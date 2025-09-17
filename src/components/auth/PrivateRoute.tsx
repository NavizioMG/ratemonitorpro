import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: ReactNode;
}

// 🎨 Fancy “Building Account” Screen
const WelcomeScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center animate-fade-in-up">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="bg-primary text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-md">
          RMP
        </div>
      </div>

      {/* Title + Subtitle */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Welcome to <span className="text-primary">Rate Monitor Pro</span>
      </h2>
      <p className="text-gray-600 mb-6">
        We’re building your dashboard and finishing account setup.
      </p>

      {/* Loading animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-primary text-sm font-medium">
            <span>⏳</span>
          </div>
        </div>
      </div>

      {/* Helper note */}
      <p className="text-gray-400 text-xs mt-6">
        This usually only takes a few seconds…
      </p>
    </div>
  </div>
);

// ✨ PrivateRoute with WelcomeScreen
export function PrivateRoute({ children }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <WelcomeScreen />;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

// PublicRoute stays the same, or you can also show WelcomeScreen while loading
export function PublicRoute({ children }: Props) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <WelcomeScreen />;
  }

  if (session) {
    const from = (location.state as any)?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Add some simple animations to your global CSS (index.css):
// .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
