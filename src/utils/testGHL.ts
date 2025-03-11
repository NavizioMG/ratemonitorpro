import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'GHLTest';

export async function testGHLIntegration(userId: string) {
  try {
    debug.logInfo(Category.API, 'Starting GHL integration test', { userId }, COMPONENT_ID);

    // 1. Verify sub-account exists
    const { data: subaccount, error: subaccountError } = await supabase
      .from('ghl_subaccounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subaccountError) {
      throw new Error('GHL sub-account not found');
    }

    // 2. Test client sync
    const testClient = {
      firstName: 'Test',
      lastName: 'Client',
      email: `test.${Date.now()}@example.com`,
      phone: '+11234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      customFields: {
        current_rate: '6.5',
        target_rate: '6.0',
        loan_amount: '300000',
        term_years: '30',
        lender: 'Test Bank'
      }
    };

    const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-ghl-client', {
      body: {
        locationId: subaccount.ghl_location_id,
        client: testClient
      }
    });

    if (syncError) {
      throw new Error('Failed to sync test client');
    }

    // 3. Test adding a tag
    const { error: tagError } = await supabase.functions.invoke('add-ghl-tag', {
      body: {
        locationId: subaccount.ghl_location_id,
        contactId: syncData.contact.id,
        tag: 'Test Tag'
      }
    });

    if (tagError) {
      throw new Error('Failed to add test tag');
    }

    // 4. Test updating contact
    const { error: updateError } = await supabase.functions.invoke('update-ghl-contact', {
      body: {
        locationId: subaccount.ghl_location_id,
        contactId: syncData.contact.id,
        updates: {
          firstName: 'Updated Test',
          customFields: {
            current_rate: '6.25'
          }
        }
      }
    });

    if (updateError) {
      throw new Error('Failed to update test contact');
    }

    // Clean up test data
    await fetch(`https://rest.gohighlevel.com/v1/contacts/${syncData.contact.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${subaccount.ghl_api_key}`,
      }
    });

    return {
      success: true,
      message: 'GHL integration test completed successfully',
      details: {
        subaccountId: subaccount.ghl_location_id,
        testContactId: syncData.contact.id
      }
    };
  } catch (err) {
    debug.logError(Category.API, 'GHL integration test failed', {}, err, COMPONENT_ID);
    return {
      success: false,
      message: err.message,
      error: err
    };
  }
}