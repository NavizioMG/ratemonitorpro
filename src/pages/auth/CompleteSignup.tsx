import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';
import { supabase } from '../../lib/supabase';
import { getSupabaseEdgeUrl } from '../../lib/environment';


const COMPONENT_ID = 'CompleteSignup';

export function CompleteSignup() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasRun = useRef(false); // Prevent double runs

  useEffect(() => {
    if (completed || hasRun.current) return;

    hasRun.current = true;

    const completeSignup = async () => {
      try {
        debug.logInfo(Category.AUTH, 'Starting signup completion', {}, COMPONENT_ID);

        console.log('Raw searchParams:', Object.fromEntries(searchParams));

        const success = searchParams.get('success');
        if (!success || success !== 'true') {
          throw new Error('Payment was not completed');
        }

        const email = searchParams.get('email') || localStorage.getItem('signupEmail');
        const fullName = searchParams.get('fullName') || localStorage.getItem('signupFullName');
        const companyName = searchParams.get('companyName') || localStorage.getItem('signupCompanyName');
        const phone = searchParams.get('phone') || localStorage.getItem('signupPhone') || '';
        const password = searchParams.get('password') || localStorage.getItem('signupPassword');
        const timezone = searchParams.get('timezone') || localStorage.getItem('signupTimezone');

        console.log('CompleteSignup data:', { email, fullName, companyName, phone, timezone });

        if (!email || !fullName || !companyName || !password || !timezone) {
          localStorage.clear();
          throw new Error('Signup data missing—please start over');
        }

        const fixedEmail = email.replace(' ', '+');
        console.log('Fixed email:', fixedEmail);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fixedEmail)) {
          throw new Error(`Invalid email format: ${fixedEmail}`);
        }

        // Step 1: Securely create GHL sub-account & contact via Netlify function
const ghlResponse = await fetch('/.netlify/functions/add-client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName,
    email: fixedEmail,
    phone,
    companyName,
    timezone,
  }),
});

const { locationId, rmpContactId, error: ghlError } = await ghlResponse.json();

if (!ghlResponse.ok || ghlError) {
  throw new Error('Failed to create GHL contact.');
}

        // Step 2: Handle Supabase auth
        let userId;
// Try sign-in first
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: fixedEmail,
  password
});

if (signInData?.user) {
  console.log('User signed in:', signInData.user.id);
  userId = signInData.user.id;
} else if (signInError?.message === 'Invalid login credentials') {
  // Check if user exists before signup
  const { data: existingUser, error: checkError } = await supabase
    .rpc('get_user_by_email', { email: fixedEmail }); // Add this RPC!
  if (checkError) throw checkError;

  if (existingUser) {
    throw new Error('Email already registered—please use correct password or reset it.');
  }

  console.log('New user—signing up:', fixedEmail);
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

        // Step 3: Upsert profiles
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: fullName,
            company_name: companyName,
            phone,
            timezone,
            ghl_location_id: locationId,
            ghl_rmp_contact_id: rmpContactId
          }, { onConflict: 'id' });

        if (updateError) throw updateError;

        // Step 4: Sign in (if not already)
        if (!signInData?.user) {
          await supabase.auth.signInWithPassword({ email: fixedEmail, password });
        }

        // Step 5: Add welcome notification
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Welcome to Rate Monitor Pro!',
          message: 'Your account is now active. Get started by adding your first client.',
          type: 'system'
        });

        // Cleanup
        localStorage.removeItem('signupEmail');
        localStorage.removeItem('signupFullName');
        localStorage.removeItem('signupCompanyName');
        localStorage.removeItem('signupPhone');
        localStorage.removeItem('signupPassword');
        localStorage.removeItem('signupTimezone');

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