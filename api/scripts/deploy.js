import { supabase } from '../../src/lib/supabase.js';

async function deploy() {
  try {
    console.log('Deploying Edge Functions...');
    
    const functions = [
      'create-signup-session',
      'verify-checkout-session',
      'fetch-rates',
      'stripe-webhook',
      'create-checkout-session',
      'get-subscription',
      'cancel-subscription',
      'get-billing-history'
    ];

    for (const func of functions) {
      console.log(`Deploying ${func}...`);
      const { error } = await supabase.functions.deploy(func);
      if (error) throw error;
      console.log(`${func} deployed successfully`);
    }

    console.log('All functions deployed successfully');
  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
}

deploy();