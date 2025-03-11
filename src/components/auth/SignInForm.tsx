import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface Props {
  onForgotPassword: () => void;
}

export function SignInForm({ onForgotPassword }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password minimum length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      debug.logInfo(Category.AUTH, 'Starting sign in process', { email });
      
      await signIn(email, password);
      
      // Reset attempts on successful login
      setAttempts(0);
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      // Determine the specific error message
      let errorMessage = 'Invalid email or password';
      
      if (err instanceof Error) {
        if (err.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
      }

      // If multiple failed attempts, add suggestion
      if (attempts >= 2) {
        errorMessage += '\nTip: Make sure you\'re using the correct email address and check your caps lock.';
      }

      debug.logError(Category.AUTH, 'Sign in error', { attempts: attempts + 1 }, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-primary" />
          <h2 className="ml-2 text-2xl font-bold text-primary">Sign In</h2>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Sign in failed</h3>
                <div className="mt-1 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary disabled:bg-gray-100 ${
              error && !email ? 'border-red-500' : ''
            }`}
            id="email"
            type="email"
            placeholder="Email"
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

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary disabled:bg-gray-100 ${
              error && !password ? 'border-red-500' : ''
            }`}
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            disabled={loading}
            required
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:text-primary-dark focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            className={`bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              loading ? 'opacity-75' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}