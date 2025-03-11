import { loadStripe } from '@stripe/stripe-js';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'StripeService';
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
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

export async function createCheckoutSession(formData: {
  email: string;
  fullName: string;
  companyName: string;
  phone?: string;
}) {
  try {
    debug.logInfo(Category.API, 'Creating checkout session', { email: formData.email }, COMPONENT_ID);
    
    const stripe = await stripePromise;
    const isDev = import.meta.env.DEV; // True in dev, false in prod
    const successUrl = isDev
      ? 'http://localhost:5173/auth/complete-signup?success=true'
      : 'https://ratemonitorpro.com/auth/complete-signup?success=true';

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: STANDARD_PLAN.id, quantity: 1 }],
      mode: 'subscription',
      customerEmail: formData.email,
      successUrl,
      cancelUrl: isDev 
        ? 'http://localhost:5173/auth?canceled=true'
        : 'https://ratemonitorpro.com/auth?canceled=true',
      clientReferenceId: `${formData.fullName}|${formData.companyName}|${formData.phone || ''}`,
    });

    if (error) throw error;
  } catch (err) {
    debug.logError(Category.API, 'Error creating checkout session', {}, err, COMPONENT_ID);
    throw err;
  }
}

// Placeholder for future server-side features
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