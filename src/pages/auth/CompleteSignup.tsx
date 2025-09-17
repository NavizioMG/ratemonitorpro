import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';
import { supabase } from '../../lib/supabase';

const COMPONENT_ID = 'CompleteSignup';

export function CompleteSignup() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (completed || hasRun.current) return;
    hasRun.current = true;

    const completeSignup = async () => {
      try {
        debug.logInfo(Category.AUTH, 'Starting signup completion', {}, COMPONENT_ID);

        const success = searchParams.get('success');
        if (!success || success !== 'true') throw new Error('Payment was not completed');

        const email = searchParams.get('email') || localStorage.getItem('signupEmail');
        const fullName = searchParams.get('fullName') || localStorage.getItem('signupFullName');
        const companyName = searchParams.get('companyName') || localStorage.getItem('signupCompanyName');
        const phone = searchParams.get('phone') || localStorage.getItem('signupPhone') || '';
        const password = searchParams.get('password') || localStorage.getItem('signupPassword');
        const timezone = searchParams.get('timezone') || localStorage.getItem('signupTimezone');

        if (!email || !fullName || !companyName || !password || !timezone) {
          localStorage.clear();
          throw new Error('Signup data missing—please start over');
        }

        const fixedEmail = email.replace(' ', '+');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fixedEmail)) {
          throw new Error(`Invalid email format: ${fixedEmail}`);
        }

        // 🔍 DEBUG: Let's see what data we have
        console.log('🔧 Debug - Available signup data:', {
          email: fixedEmail,
          fullName,
          companyName,
          phone,
          timezone,
          password: password ? 'Present' : 'Missing'
        });

        console.log('🔧 Debug - Search params:', {
          success: searchParams.get('success'),
          email: searchParams.get('email'),
          fullName: searchParams.get('fullName'),
          companyName: searchParams.get('companyName'),
          phone: searchParams.get('phone'),
          timezone: searchParams.get('timezone')
        });

        console.log('🔧 Debug - LocalStorage:', {
          signupEmail: localStorage.getItem('signupEmail'),
          signupFullName: localStorage.getItem('signupFullName'),
          signupCompanyName: localStorage.getItem('signupCompanyName'),
          signupPhone: localStorage.getItem('signupPhone'),
          signupPassword: localStorage.getItem('signupPassword') ? 'Present' : 'Missing',
          signupTimezone: localStorage.getItem('signupTimezone')
        });

        /* 
        🚧 COMMENTED OUT: GHL Integration
        Theory: GHL might already be handled in create-checkout-session Edge Function
        
        // Create GHL sub-account via Edge Function
        console.log('🔧 Creating GHL sub-account via Edge Function');
        
        const ghlResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ghl-subaccount`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: 'temp-user-id', // Use temporary ID since Edge Function requires it
            companyName,
            email: fixedEmail,
            phone: phone || '', // Ensure phone is not undefined
            address: '123 Main St'
          })
        });

        if (!ghlResponse.ok) {
          const errorText = await ghlResponse.text();
          console.error('GHL Edge Function Error:', errorText);
          console.error('Request payload was:', {
            userId: 'temp-user-id',
            companyName,
            email: fixedEmail,
            phone: phone || '',
            address: '123 Main St'
          });
          throw new Error(`GHL integration failed: ${ghlResponse.status}`);
        }

        const ghlResult = await ghlResponse.json();
        const locationId = ghlResult.ghlData?.locationId;
        const rmpContactId = null; // This Edge Function doesn't create RMP contacts

        console.log('GHL sub-account created successfully:', { locationId });
        */

        // 🔧 TEMPORARY: Set dummy values for GHL data
        const locationId = null; // Will be set by create-checkout-session if it works
        const rmpContactId = null;

        console.log('🔧 Proceeding without GHL call - assuming it was handled during checkout');

        let userId;
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: fixedEmail, password });

        if (signInData?.user) {
          userId = signInData.user.id;
          console.log('🔧 User signed in successfully:', userId);
        } else if (signInError?.message === 'Invalid login credentials') {
          const { data: existingUser, error: checkError } = await supabase.rpc('get_user_by_email', { email: fixedEmail });
          if (checkError) throw checkError;
          if (existingUser) throw new Error('Email already registered—please use correct password or reset it.');

          console.log('🔧 Creating new user account');
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: fixedEmail,
            password,
            options: {
              data: {
                full_name: fullName,
                company_name: companyName,
                phone,
                timezone,
                ghl_location_id: locationId,
                ghl_rmp_contact_id: rmpContactId
              }
            }
          });
          if (signUpError) throw signUpError;
          userId = data.user?.id;
          if (!userId) throw new Error('User ID not found after signup');
        } else {
          throw signInError;
        }

        console.log('🔧 Updating user profile');
        const { error: updateError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          company_name: companyName,
          phone,
          timezone,
          ghl_location_id: locationId,
          ghl_rmp_contact_id: rmpContactId
        }, { onConflict: 'id' });

        if (updateError) throw updateError;

        if (!signInData?.user) {
          console.log('🔧 Signing in user after account creation');
          await supabase.auth.signInWithPassword({ email: fixedEmail, password });
        }

        console.log('🔧 Creating welcome notification');
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Welcome to Rate Monitor Pro!',
          message: 'Your account is now active. Get started by adding your first client.',
          type: 'system'
        });

        console.log('🔧 Signup completion successful - cleaning up and redirecting');
        localStorage.clear();
        setCompleted(true);
        navigate('/dashboard');

      } catch (err) {
        console.error('Signup error:', err.message);
        debug.logError(Category.AUTH, 'Signup completion failed', {}, err, COMPONENT_ID);
        setError(err instanceof Error ? err.message : 'Failed to complete signup');
        setLoading(false);
      }
    };

    completeSignup();
  }, [searchParams, navigate, completed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Completing your registration...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Registration Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Return to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Welcome to Rate Monitor Pro!</h2>
        <p className="mt-2 text-gray-600">Your account is ready—log in to get started.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}