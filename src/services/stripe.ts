// src/services/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'StripeService';

const STRIPE_MODE = import.meta.env.VITE_STRIPE_MODE || 'test'; // 'test' or 'live'

const STRIPE_PUBLISHABLE_KEY = STRIPE_MODE === 'live'
  ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE
  : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;

const STRIPE_PRICE_ID = STRIPE_MODE === 'live'
  ? import.meta.env.VITE_STRIPE_PRICE_ID_LIVE
  : import.meta.env.VITE_STRIPE_PRICE_ID_TEST;

// stripePromise can be kept if you use Stripe Elements elsewhere in the app
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STANDARD_PLAN = {
  id: STRIPE_PRICE_ID,
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

export function getAppUrl(): string {
  const url = import.meta.env.VITE_APP_URL || 'https://ratemonitorpro.com';
  return url;
}

/**
 * Creates a Stripe checkout session by calling a server-side Supabase Edge Function.
 * This is the modern, secure way to handle checkouts, allowing user data to be
 * stored in Stripe's metadata instead of relying on localStorage.
 */
export const createCheckoutSession = async (userData: {
  email: string;
  fullName: string;
  companyName: string;
  phone: string;
  password: string;
  timezone: string;
}) => {
  try {
    debug.logInfo(Category.API, 'Requesting server-side checkout session', { email: userData.email }, COMPONENT_ID);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email: userData.email,
        userData // Pass the full userData object to be stored in metadata
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    if (!url) {
      throw new Error('No checkout URL returned from server');
    }
    
    // Redirect the user to the Stripe Checkout page
    window.location.href = url;

  } catch (err) {
    debug.logError(Category.API, 'Error creating checkout session', {}, err, COMPONENT_ID);
    throw err; // Re-throw the error so the UI can catch it
  }
};

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

// 🔧 Helper to check current mode
export function getStripeMode() {
  return STRIPE_MODE;
}

export function isTestMode() {
  return STRIPE_MODE === 'test';
}