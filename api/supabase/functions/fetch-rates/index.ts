import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MortgageRate {
  date: string;
  type: string;
  value: number;
  termYears: number;
}

async function scrapeRates(): Promise<MortgageRate[]> {
  const url = "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed";
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const html = await response.text();
  const today = new Date().toISOString().split('T')[0];
  
  // Try exact div structure first
  const exactMatch = html.match(/<div class="current-mtg-rate">.*?<div class="rate">(\d+\.\d+)%<\/div>/s);
  if (exactMatch) {
    const rate = parseFloat(exactMatch[1]);
    if (!isNaN(rate) && rate > 0 && rate < 15) {
      return [
        {
          date: today,
          type: 'Fixed',
          value: rate,
          termYears: 30
        },
        {
          date: today,
          type: 'Fixed',
          value: Math.max(rate - 0.625, 0), // 15-year is typically 0.5-0.75 lower
          termYears: 15
        },
        {
          date: today,
          type: 'Fixed',
          value: Math.max(rate - 0.3125, 0), // 20-year is typically in between
          termYears: 20
        }
      ];
    }
  }
  
  // Fallback to any rate div
  const fallbackMatch = html.match(/<div class="rate">(\d+\.\d+)%<\/div>/);
  if (fallbackMatch) {
    const rate = parseFloat(fallbackMatch[1]);
    if (!isNaN(rate) && rate > 0 && rate < 15) {
      return [
        {
          date: today,
          type: 'Fixed',
          value: rate,
          termYears: 30
        },
        {
          date: today,
          type: 'Fixed',
          value: Math.max(rate - 0.625, 0),
          termYears: 15
        },
        {
          date: today,
          type: 'Fixed',
          value: Math.max(rate - 0.3125, 0),
          termYears: 20
        }
      ];
    }
  }
  
  throw new Error('Rate not found in HTML');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First try to get today's rates from the database
    const today = new Date().toISOString().split('T')[0];
    const { data: existingRates, error: fetchError } = await supabase
      .from('rate_history')
      .select('*')
      .eq('rate_date', today)
      .order('term_years', { ascending: true });

    if (fetchError) throw fetchError;

    // If we already have today's rates, return them
    if (existingRates && existingRates.length > 0) {
      console.log('Returning existing rates:', existingRates);
      return new Response(
        JSON.stringify(existingRates),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Otherwise, scrape new rates
    console.log('Scraping new rates...');
    const rates = await scrapeRates();
    console.log('Scraped rates:', rates);

    // Store rates in database
    for (const rate of rates) {
      const { error: insertError } = await supabase
        .from('rate_history')
        .insert({
          rate_date: rate.date,
          rate_type: rate.type,
          rate_value: rate.value,
          term_years: rate.termYears
        });

      if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
        console.error('Error storing rate:', insertError);
      }
    }

    return new Response(
      JSON.stringify(rates),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch rates' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});