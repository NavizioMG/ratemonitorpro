import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, User, Building2, Phone, AlertTriangle, Trash2, Globe, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';
import axios from 'axios';

export function Settings() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    emailNotifications: true,
    rateAlerts: true,
    systemUpdates: true,
    timezone: 'America/Denver',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    website: ''
  });

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Fixed: Use snake_case column names to match database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, company_name, phone, timezone, address, city, state, postal_code, country, website, ghl_location_id')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setError('Failed to load profile data');
        return;
      }

      const { data: prefsData, error: prefsError } = await supabase
      .from('notification_prefs')
      .select('email_notifications, rate_alerts, system_updates')
      .eq('user_id', session.user.id)
      .maybeSingle();

      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error('Prefs fetch error:', prefsError);
        setError('Failed to load notification preferences');
        return;
      }

      setFormData({
        fullName: profileData?.full_name || '',
        companyName: profileData?.company_name || '',
        phone: profileData?.phone || '',
        emailNotifications: prefsData?.email_notifications ?? true,
        rateAlerts: prefsData?.rate_alerts ?? true,
        systemUpdates: prefsData?.system_updates ?? true,
        timezone: profileData?.timezone || 'America/Denver',
        address: profileData?.address || '',
        city: profileData?.city || '',
        state: profileData?.state || '',
        postalCode: profileData?.postal_code || '', // Fixed: Use postal_code from database
        country: profileData?.country || '',
        website: profileData?.website || ''
      });
    };
    fetchData();
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!session?.user?.id) throw new Error('User not authenticated');

      console.log('Updating Supabase profile:', formData);
      // Fixed: Use snake_case column names in update
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          company_name: formData.companyName,
          phone: formData.phone,
          timezone: formData.timezone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode, // Fixed: Use postal_code for database
          country: formData.country,
          website: formData.website
        })
        .eq('id', session.user.id);
      if (profileError) throw profileError;

      console.log('Updating notification prefs:', formData);
      const { error: prefsError } = await supabase
        .from('notification_prefs')
        .upsert({
          user_id: session.user.id,
          email_notifications: formData.emailNotifications,
          rate_alerts: formData.rateAlerts,
          system_updates: formData.systemUpdates
        }, { onConflict: 'user_id' });
      if (prefsError) throw prefsError;

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('ghl_location_id')
        .eq('id', session.user.id)
        .single();
      if (fetchError) throw fetchError;

      if (profile?.ghl_location_id) {
        console.log('Updating GHL sub-account via Netlify function:', profile.ghl_location_id);
      
        const response = await fetch('/.netlify/functions/update-subaccount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ghlLocationId: profile.ghl_location_id,
            companyName: formData.companyName,
            email: session.user.email,
            phone: formData.phone,
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            timezone: formData.timezone,
            website: formData.website,
          }),
        });
      
        const result = await response.json();
      
        if (!response.ok) {
          console.error('GHL update error:', result);
          throw new Error('Failed to update GHL sub-account');
        } else {
          console.log('GHL sub-account update successful:', result);
        }
      } else {
        console.warn('No GHL location ID—skipping update');
      }
      
      debug.logInfo(Category.API, 'Profile and preferences updated', { userId: session.user.id });
      } catch (err) {
        console.error('Update error:', err.message);
        debug.logError(Category.API, 'Error updating profile', {}, err);
        setError('Failed to update profile. Check console for details.');
      } finally {
        setLoading(false);
      }
    };
      
      // ✅ Now you're ready to declare the next function:
      const handleDeleteAccount = async () => {
      
    setLoading(true);
    setError(null);

    try {
      if (!session?.user?.id) throw new Error('User not authenticated');

      await supabase.from('clients').delete().eq('broker_id', session.user.id);
      await supabase.from('notification_prefs').delete().eq('user_id', session.user.id);
      await supabase.from('profiles').delete().eq('id', session.user.id);
      await supabase.auth.admin.deleteUser(session.user.id);

      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Delete error:', err.message);
      debug.logError(Category.API, 'Error deleting account', {}, err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Rest of the JSX remains unchanged—form, UI, modal, etc.
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your account preferences and notification settings</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              <p className="mt-1 text-sm text-gray-500">Update your personal and business information</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><User className="h-4 w-4 mr-2" />Full Name</div>
                </label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Building2 className="h-4 w-4 mr-2" />Company Name</div>
                </label>
                <input type="text" value={formData.companyName} onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />Email</div>
                </label>
                <input type="email" value={session?.user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />Phone Number</div>
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Globe className="h-4 w-4 mr-2" />Timezone</div>
                </label>
                <select value={formData.timezone} onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                  {timezones.map((tz) => (<option key={tz} value={tz}>{tz}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />Address</div>
                </label>
                <input type="text" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />City</div>
                </label>
                <input type="text" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />State</div>
                </label>
                <input type="text" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />Postal Code</div>
                </label>
                <input type="text" value={formData.postalCode} onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Globe className="h-4 w-4 mr-2" />Country</div>
                </label>
                <input type="text" value={formData.country} onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center"><Globe className="h-4 w-4 mr-2" />Website</div>
                </label>
                <input type="url" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">Choose how you want to receive notifications</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                <input type="checkbox" checked={formData.emailNotifications} onChange={(e) => setFormData(prev => ({ ...prev, emailNotifications: e.target.checked }))} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">Rate Alerts</label>
                    <p className="text-sm text-gray-500">Get notified when rates match your targets</p>
                  </div>
                </div>
                <input type="checkbox" checked={formData.rateAlerts} onChange={(e) => setFormData(prev => ({ ...prev, rateAlerts: e.target.checked }))} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">System Updates</label>
                    <p className="text-sm text-gray-500">Receive notifications about system updates</p>
                  </div>
                </div>
                <input type="checkbox" checked={formData.systemUpdates} onChange={(e) => setFormData(prev => ({ ...prev, systemUpdates: e.target.checked }))} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800">Danger Zone</h3>
          <p className="mt-1 text-sm text-red-600">Once you delete your account, there is no going back. Please be certain.</p>
          <div className="mt-4">
            <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <Trash2 className="h-4 w-4 mr-2" />Delete Account
            </button>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDeleteAccount} disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm">
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}