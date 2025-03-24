import axios from 'axios';
import { supabase } from '../lib/supabase';

export async function createGHLSubAccount(
  userId: string,
  companyName: string,
  email: string,
  fullName?: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string,
  website?: string,
  timezone?: string
) {
  const agencyApiKey = import.meta.env.VITE_GHL_API_KEY;
  const rmpApiKey = import.meta.env.VITE_GHL_RMP_API_KEY;
  const companyId = import.meta.env.VITE_GHL_COMPANY_ID;
  const rmpLocationId = import.meta.env.VITE_RMP_LOCATION_ID;

  if (!agencyApiKey || !rmpApiKey || !companyId || !rmpLocationId) {
    throw new Error('Missing one or more required GHL environment variables');
  }

  const safeFullName = fullName || email.split('@')[0];
  const [firstName, ...lastNameParts] = safeFullName.split(' ');
  const lastName = lastNameParts.join(' ') || '';

  // Step 1: Create new sub-account
  const locationPayload = {
    companyId,
    name: companyName,
    businessName: companyName,
    email,
    phone: phone || '',
    firstName,
    lastName,
    address: address || '123 Main St',
    city: city || 'Denver',
    state: state || 'CO',
    postalCode: postalCode || '80202',
    country: country || 'US',
    timezone: timezone || 'America/Denver',
    website: website || 'https://example.com',
    business: {
      name: companyName,
      email,
      address: address || '123 Main St',
      city: city || 'Denver',
      state: state || 'CO',
      postalCode: postalCode || '80202',
      country: country || 'US',
      timezone: timezone || 'America/Denver'
    }
  };

  const locationResponse = await axios.post(
    'https://rest.gohighlevel.com/v1/locations/',
    locationPayload,
    {
      headers: {
        Authorization: `Bearer ${agencyApiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const locationId = locationResponse.data.id;

  // Step 2: Create or update contact in RMP sub-account
  const contactPayload = {
    locationId: rmpLocationId,
    email,
    firstName,
    lastName,
    phone: phone || '',
    address1: address || '123 Main St',
    city: city || 'Denver',
    state: state || 'CO',
    postalCode: postalCode || '80202',
    country: country || 'US',
    timezone: timezone || 'America/Denver',
    tags: ['#welcomesms'],
    source: `Signup-${Date.now()}`
  };

  let rmpContactId;

  const searchResponse = await axios.get(
    `https://rest.gohighlevel.com/v1/contacts/?locationId=${rmpLocationId}&query=${email}`,
    {
      headers: {
        Authorization: `Bearer ${rmpApiKey}`
      }
    }
  );

  if (searchResponse.data.contacts.length > 0) {
    rmpContactId = searchResponse.data.contacts[0].id;
    await axios.put(
      `https://rest.gohighlevel.com/v1/contacts/${rmpContactId}`,
      contactPayload,
      {
        headers: {
          Authorization: `Bearer ${rmpApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } else {
    const contactResponse = await axios.post(
      'https://rest.gohighlevel.com/v1/contacts/',
      contactPayload,
      {
        headers: {
          Authorization: `Bearer ${rmpApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    rmpContactId = contactResponse.data.contact.id;
  }

  // Optional: Store subaccount info in Supabase if user ID provided
  if (userId) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        ghl_location_id: locationId,
        ghl_rmp_contact_id: rmpContactId,
        company_name: companyName
      })
      .eq('id', userId);
    if (error) throw error;
  }

  return { locationId, rmpContactId };
}
