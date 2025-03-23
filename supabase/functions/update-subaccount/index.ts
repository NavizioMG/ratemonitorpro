// File: netlify/functions/update-subaccount.ts

import { Handler } from '@netlify/functions';
import axios from 'axios';

const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const {
      ghlLocationId,
      companyName,
      email,
      phone,
      fullName,
      address = '123 Main St',
      city = 'Denver',
      state = 'CO',
      postalCode = '80202',
      country = 'US',
      timezone = 'America/Denver',
      website = 'https://example.com'
    } = body;

    if (!ghlLocationId || !companyName || !email || !fullName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    const ghlApiKey = process.env.VITE_GHL_API_KEY;
    if (!ghlApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'GHL API key is not set' }),
      };
    }

    const response = await axios.put(
      `https://rest.gohighlevel.com/v1/locations/${ghlLocationId}`,
      {
        name: companyName,
        businessName: companyName,
        email,
        phone,
        firstName,
        lastName,
        address,
        city,
        state,
        postalCode,
        country,
        timezone,
        website,
        business: {
          name: companyName,
          email,
          address,
          city,
          state,
          postalCode,
          country,
          timezone,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: response.data }),
    };
  } catch (error) {
    console.error('[update-subaccount] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unexpected error' }),
    };
  }
};

export { handler };
