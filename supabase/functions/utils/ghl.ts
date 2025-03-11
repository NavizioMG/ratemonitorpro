import { debug } from './debug.ts';

interface GHLLocationParams {
  userId: string;
  companyName: string;
  email: string;
}

interface GHLLocation {
  id: string;
  name: string;
  apiKey: string;
}

export async function createGHLLocation(params: GHLLocationParams): Promise<GHLLocation> {
  const ghlApiKey = Deno.env.get('GHL_API_KEY');
  if (!ghlApiKey) {
    throw new Error('GHL API key not configured');
  }

  try {
    debug.logInfo('Creating GHL location', { 
      companyName: params.companyName,
      email: params.email 
    });

    const response = await fetch('https://rest.gohighlevel.com/v1/locations/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: params.companyName,
        email: params.email,
        timezone: 'America/New_York',
        country: 'US'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GHL API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.location?.id || !data.location?.apiKey) {
      throw new Error('Invalid response from GHL API');
    }

    return {
      id: data.location.id,
      name: data.location.name,
      apiKey: data.location.apiKey
    };
  } catch (error) {
    debug.logError('Error creating GHL location', { error });
    throw error;
  }
}