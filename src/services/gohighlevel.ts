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
  const rmpLocationId = 'hgTyQWBiHnyV7fCTQDM0';

  console.log('Env vars:', {
    VITE_GHL_API_KEY: agencyApiKey ? 'Set' : 'Unset',
    VITE_GHL_RMP_API_KEY: rmpApiKey ? 'Set' : 'Unset',
    VITE_GHL_COMPANY_ID: companyId ? 'Set' : 'Unset'
  });

  if (!agencyApiKey) throw new Error('VITE_GHL_API_KEY not set in .env');
  if (!rmpApiKey) throw new Error('VITE_GHL_RMP_API_KEY not set in .env');
  if (!companyId) throw new Error('VITE_GHL_COMPANY_ID not set in .env');

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

  console.log('Sending GHL location payload:', locationPayload);

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
  console.log('GHL sub-account response:', locationResponse.data);

  // Step 2: Check for existing contact in RMP
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

  console.log('Sending GHL contact payload:', contactPayload);

  try {
    // Check if contact exists
    const searchResponse = await axios.get(
      `https://rest.gohighlevel.com/v1/contacts/?locationId=${rmpLocationId}&query=${email}`,
      {
        headers: {
          Authorization: `Bearer ${rmpApiKey}`
        }
      }
    );

    let rmpContactId;
    if (searchResponse.data.contacts.length > 0) {
      // Update existing contact
      rmpContactId = searchResponse.data.contacts[0].id;
      console.log('Found existing contact:', rmpContactId);
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
      console.log('Updated existing contact:', rmpContactId);
    } else {
      // Create new contact
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
      console.log('Raw GHL contact response:', contactResponse.data);
    }

    if (!rmpContactId) throw new Error('Failed to get or create contact ID');

    // Step 3: Store in profiles (will be overwritten by explicit update)
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
  } catch (err) {
    console.error('GHL contact creation failed:', err.response?.data || err.message);
    throw err;
  }
}