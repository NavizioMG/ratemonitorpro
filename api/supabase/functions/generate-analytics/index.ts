import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user's session
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get all clients for the broker
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        *,
        mortgages (
          current_rate,
          target_rate,
          loan_amount,
          term_years
        )
      `)
      .eq('broker_id', user.id);

    if (clientsError) throw clientsError;

    // Get current market rates
    const { data: rates, error: ratesError } = await supabase
      .from('rate_history')
      .select('*')
      .order('rate_date', { ascending: false })
      .limit(1);

    if (ratesError) throw ratesError;

    // Calculate analytics
    const analytics = {
      totalClients: clients.length,
      totalLoanAmount: 0,
      averageRate: 0,
      clientsAboveMarket: 0,
      potentialSavings: 0,
      rateDistribution: {
        below4: 0,
        below5: 0,
        below6: 0,
        above6: 0,
      },
    };

    const currentMarketRate = rates[0]?.rate_value || 0;

    clients.forEach(client => {
      const mortgage = client.mortgages?.[0];
      if (mortgage) {
        analytics.totalLoanAmount += mortgage.loan_amount;
        analytics.averageRate += mortgage.current_rate;

        if (mortgage.current_rate > currentMarketRate) {
          analytics.clientsAboveMarket++;
          // Calculate potential monthly savings
          const currentPayment = calculateMonthlyPayment(
            mortgage.loan_amount,
            mortgage.current_rate,
            mortgage.term_years
          );
          const potentialPayment = calculateMonthlyPayment(
            mortgage.loan_amount,
            currentMarketRate,
            mortgage.term_years
          );
          analytics.potentialSavings += (currentPayment - potentialPayment);
        }

        // Rate distribution
        if (mortgage.current_rate < 4) analytics.rateDistribution.below4++;
        else if (mortgage.current_rate < 5) analytics.rateDistribution.below5++;
        else if (mortgage.current_rate < 6) analytics.rateDistribution.below6++;
        else analytics.rateDistribution.above6++;
      }
    });

    if (clients.length > 0) {
      analytics.averageRate /= clients.length;
    }

    return new Response(
      JSON.stringify(analytics),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}