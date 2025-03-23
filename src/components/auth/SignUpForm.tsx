import { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';
import { createCheckoutSession } from '../../services/stripe';
import { getAppUrl } from '../../services/stripe'; // 👈 only if it's not already imported

console.log('APP URL:', getAppUrl()); // ✅ this is the line that will log the value

export function SignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    phone: '',
    password: '',
    timezone: 'America/Denver' // Default
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu'
    // Add more via Intl.supportedValuesOf('timeZone') later
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.fullName || !formData.companyName || !formData.password || !formData.timezone) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      debug.logInfo(Category.AUTH, 'Starting payment process', { email: formData.email });

      localStorage.setItem('signupEmail', formData.email);
      localStorage.setItem('signupFullName', formData.fullName);
      localStorage.setItem('signupCompanyName', formData.companyName);
      localStorage.setItem('signupPhone', formData.phone || '');
      localStorage.setItem('signupPassword', formData.password);
      localStorage.setItem('signupTimezone', formData.timezone);

      await createCheckoutSession(formData);
    } catch (err) {
      debug.logError(Category.AUTH, 'Payment process failed', {}, err);
      setError(err instanceof Error ? err.message : 'Failed to start payment');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="flex items-center justify-center mb-6">
          <UserPlus className="w-8 h-8 text-primary" />
          <h2 className="ml-2 text-2xl font-bold text-primary">Create Account</h2>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            disabled={loading}
            autoComplete="name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="companyName">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            required
            disabled={loading}
            autoComplete="organization"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            disabled={loading}
            autoComplete="tel"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="timezone">
            Timezone <span className="text-red-500">*</span>
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
            id="timezone"
            value={formData.timezone}
            onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
            required
            disabled={loading}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-primary hover:text-primary-dark">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}