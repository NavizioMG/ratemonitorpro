import { loadStripe } from '@stripe/stripe-js';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'StripeService';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STANDARD_PLAN = {
  id: 'price_1QuFSOEsyVlivUjUI616psS8',
  name: 'Standard',
  price: 49.99,
  interval: 'month',
  features: [
    'Unlimited clients',
    'Real-time rate monitoring',
    'Smart notifications',
    'Client management',
    'Rate analytics',
    'Email support',
    'API access'
  ]
};

// ✅ Helper to get base URL dynamically based on environment
function getAppUrl(): string {
  return import.meta.env.DEV
    ? 'http://localhost:5173'
    : import.meta.env.VITE_APP_URL || 'https://ratemonitorpro.com'; // fallback just in case
}

export async function createCheckoutSession(formData: {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}) {
  try {
    debug.logInfo(Category.API, 'Creating checkout session', { email: formData.email }, COMPONENT_ID);

    const stripe = await stripePromise;
    const appUrl = getAppUrl();

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: STANDARD_PLAN.id, quantity: 1 }],
      mode: 'subscription',
      customerEmail: formData.email,
      successUrl: `${appUrl}/auth/complete-signup?success=true`,
      cancelUrl: `${appUrl}/auth?canceled=true`,
      clientReferenceId: `${formData.fullName}|${formData.companyName}|${formData.phone || ''}`,
    });

    if (error) throw error;
  } catch (err) {
    debug.logError(Category.API, 'Error creating checkout session', {}, err, COMPONENT_ID);
    throw err;
  }
}

// 🔒 Placeholders for future server-side features (secured post-MVP)
export async function getSubscriptionStatus() {
  debug.logInfo(Category.API, 'Subscription status not implemented client-side', {}, COMPONENT_ID);
  return { status: 'coming_soon' };
}

export async function cancelSubscription() {
  debug.logInfo(Category.API, 'Cancel not implemented client-side', {}, COMPONENT_ID);
  throw new Error('Use Stripe Customer Portal for now');
}

export async function getBillingHistory() {
  debug.logInfo(Category.API, 'Billing history not implemented client-side', {}, COMPONENT_ID);
  return [];
}
