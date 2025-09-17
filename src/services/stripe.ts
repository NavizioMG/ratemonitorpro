// src/services/stripe.ts - Fixed for Test/Live Suffixes

import { loadStripe } from '@stripe/stripe-js';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'StripeService';

// 🔧 FIX: Environment-based configuration with Test/Live suffixes
const STRIPE_MODE = import.meta.env.VITE_STRIPE_MODE || 'test'; // 'test' or 'live'

// 🔧 FIX: Select the right keys based on mode
const STRIPE_PUBLISHABLE_KEY = STRIPE_MODE === 'live' 
  ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE 
  : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;

const STRIPE_PRICE_ID = STRIPE_MODE === 'live'
  ? import.meta.env.VITE_STRIPE_PRICE_ID_LIVE
  : import.meta.env.VITE_STRIPE_PRICE_ID_TEST;

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Log current mode for debugging
console.log('🔧 Stripe Mode:', STRIPE_MODE);
console.log('🔧 Using Price ID:', STRIPE_PRICE_ID);
console.log('🔧 Using Publishable Key:', STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...');

// 🔍 DEBUG: Show all available env vars
console.log('🔧 Available Env Vars:', {
  mode: import.meta.env.VITE_STRIPE_MODE,
  testPrice: import.meta.env.VITE_STRIPE_PRICE_ID_TEST,
  livePrice: import.meta.env.VITE_STRIPE_PRICE_ID_LIVE,
  testKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST?.substring(0, 20),
  liveKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE?.substring(0, 20),
  selectedPrice: STRIPE_PRICE_ID,
  selectedKey: STRIPE_PUBLISHABLE_KEY?.substring(0, 20)
});

export const STANDARD_PLAN = {
  id: STRIPE_PRICE_ID, // 🔧 FIX: Now uses environment variable based on mode
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
export function getAppUrl(): string {
  const url = import.meta.env.VITE_APP_URL || 'https://ratemonitorpro.com';
  console.log('[Debug] Using APP URL:', url);
  return url;
}

// 🔧 FIX: Add validation for required environment variables
function validateStripeConfig() {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error(`VITE_STRIPE_PUBLISHABLE_KEY_${STRIPE_MODE.toUpperCase()} is required`);
  }
  if (!STRIPE_PRICE_ID) {
    throw new Error(`VITE_STRIPE_PRICE_ID_${STRIPE_MODE.toUpperCase()} is required`);
  }
  
  // Validate key matches mode
  const isTestKey = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
  const isLiveKey = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');
  
  if (STRIPE_MODE === 'test' && !isTestKey) {
    console.warn('⚠️ STRIPE_MODE is "test" but using live key!');
  }
  if (STRIPE_MODE === 'live' && !isLiveKey) {
    console.warn('⚠️ STRIPE_MODE is "live" but using test key!');
  }
}

export async function createCheckoutSession(formData: {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}) {
  try {
    validateStripeConfig();
    
    debug.logInfo(Category.API, 'Creating checkout session', { 
      email: formData.email,
      mode: STRIPE_MODE,
      priceId: STRIPE_PRICE_ID 
    }, COMPONENT_ID);

    const stripe = await stripePromise;
    const appUrl = getAppUrl();

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: STANDARD_PLAN.id, quantity: 1 }],
      mode: 'subscription',
      customerEmail: formData.email,
      successUrl: `${appUrl}/complete-signup?success=true`, // ✅ FIXED: New neutral route
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

// 🔧 NEW: Helper to check current mode
export function getStripeMode() {
  return STRIPE_MODE;
}

export function isTestMode() {
  return STRIPE_MODE === 'test';
}