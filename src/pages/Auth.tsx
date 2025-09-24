//src/pages/Auth.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { Building2 } from 'lucide-react';

type AuthView = 'signin' | 'signup' | 'forgot-password';

export function Auth() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<AuthView>(
    searchParams.get('signup') === 'true' ? 'signup' : 'signin'
  );

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return <SignUpForm />;
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setView('signin')} />;
      default:
        return <SignInForm onForgotPassword={() => setView('forgot-password')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-2">
          {view === 'signup' ? 'Get Started' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600">Mortgage Rate Monitoring System</p>
      </div>

      {renderForm()}

      {view !== 'forgot-password' && (
        <p className="mt-4 text-gray-600">
          {view === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
            className="text-primary hover:text-primary-dark font-semibold"
          >
            {view === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      )}
    </div>
  );
}