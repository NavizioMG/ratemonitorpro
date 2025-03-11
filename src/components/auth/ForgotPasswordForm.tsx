import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface Props {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      debug.logInfo(Category.AUTH, 'Starting password reset process', { email });

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
      debug.logInfo(Category.AUTH, 'Password reset email sent successfully');
    } catch (err) {
      debug.logError(Category.AUTH, 'Password reset error', {}, err);
      setError('Unable to send reset email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="flex items-center justify-center mb-6">
          <KeyRound className="w-8 h-8 text-primary" />
          <h2 className="ml-2 text-2xl font-bold text-primary">Reset Password</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                If an account exists with this email, you will receive password reset instructions shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary disabled:bg-gray-100 ${
                  error && !email ? 'border-red-500' : ''
                }`}
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={loading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className={`bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                  loading ? 'opacity-75' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Sending...</span>
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>

              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}