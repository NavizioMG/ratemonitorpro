import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

interface MortgageRate {
  rate_date: string;
  rate_type: string;
  rate_value: number;
  term_years: number;
  created_at: string;
}

async function fetchMNDRate(): Promise<MortgageRate | null> {
  try {
    const url = 'https://www.mortgagenewsdaily.com/mortgage-rates';
    console.log('Fetching 30-year rate from MND...');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`MND fetch error: ${response.status}`);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const rateElement = doc.querySelector('.current-mtg-rate .rate');
    if (!rateElement) throw new Error('Rate not found in HTML');

    const rateText = rateElement.textContent.trim();
    const value = parseFloat(rateText.replace('%', ''));
    if (isNaN(value) || value <= 0 || value > 15) throw new Error(`Invalid rate: ${value}`);

    const dateElement = doc.querySelector('.current-mtg-rate .rate-date');
    let rateDate = dateElement ? dateElement.textContent.trim() : new Date().toISOString().split('T')[0];
    if (rateDate.includes('/')) { // Convert "3/10/2025" to "2025-03-10"
      const [month, day, year] = rateDate.split('/');
      rateDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return {
      rate_date: rateDate,
      rate_type: 'fixed',
      rate_value: value,
      term_years: 30,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching 30-year rate from MND:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const rate30Year = await fetchMNDRate();
    if (!rate30Year) throw new Error('Failed to fetch 30-year rate');

    const { error: upsertError } = await supabase
      .from('rate_history')
      .upsert(rate30Year, { onConflict: 'rate_date,term_years' });
    if (upsertError) throw upsertError;

    const responseData = [{
      rate_value: rate30Year.rate_value,
      rate_date: rate30Year.rate_date,
      created_at: rate30Year.created_at,
      term_years: rate30Year.term_years,
    }];

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch rates', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});