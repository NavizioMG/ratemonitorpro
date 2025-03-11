import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  AlertTriangle, 
  Download,
  FileText,
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react';
import { 
  STANDARD_PLAN, 
  getSubscriptionStatus,
  cancelSubscription,
  getBillingHistory 
} from '../services/stripe';
import { debug, Category } from '../lib/debug';
import type { SubscriptionStatus, BillingHistory } from '../types/subscription';

export function Billing() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptionData() {
      try {
        const [subStatus, history] = await Promise.all([
          getSubscriptionStatus(),
          getBillingHistory()
        ]);
        setSubscription(subStatus);
        setBillingHistory(history);
      } catch (err) {
        debug.logError(Category.API, 'Error loading subscription data', {}, err);
        setError('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptionData();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription();
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
      setCancelModalOpen(false);
    } catch (err) {
      debug.logError(Category.API, 'Error canceling subscription', {}, err);
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your subscription and view billing history
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      {subscription && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
              <p className="mt-1 text-sm text-gray-500">
                {STANDARD_PLAN.name} Plan
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {subscription.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-gray-500">Billing Period</div>
              <div className="mt-2 flex items-center">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-900">
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Amount</div>
              <div className="mt-2 flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-900">
                  ${STANDARD_PLAN.price}/{STANDARD_PLAN.interval}
                </span>
              </div>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd ? (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Subscription Canceling
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                    You can continue using all features until then.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setCancelModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      )}

      {/* Billing History */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
            <p className="mt-2 text-sm text-gray-700">
              View and download your past invoices
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.invoice_pdf && (
                            <a
                              href={invoice.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark"
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {cancelModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cancel Subscription
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Keep Subscription
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  {loading ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}