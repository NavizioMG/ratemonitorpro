import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '../utils/testSupabase';
import { testGHLIntegration } from '../utils/testGHL';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle2, Database, Building2 } from 'lucide-react';

export function ConnectionTest() {
  const [status, setStatus] = useState<{
    supabase?: {
      success?: boolean;
      error?: string;
      authenticated?: boolean;
      hasData?: boolean;
    };
    ghl?: {
      success?: boolean;
      error?: string;
      details?: any;
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    async function checkConnections() {
      // Test Supabase connection
      const supabaseResult = await testSupabaseConnection();
      
      // Test GHL integration if user is authenticated
      let ghlResult;
      if (session?.user?.id) {
        ghlResult = await testGHLIntegration(session.user.id);
      }

      setStatus({
        supabase: supabaseResult,
        ghl: ghlResult
      });
      setLoading(false);
    }

    checkConnections();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>

        {/* Supabase Status */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-medium">Supabase Connection</h3>
          </div>

          {status.supabase?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium">Connection Successful</h3>
                <ul className="mt-2 space-y-1 text-sm text-green-700">
                  <li>✓ Database connection established</li>
                  <li>✓ {status.supabase.authenticated ? 'Authenticated' : 'Not authenticated'}</li>
                  <li>✓ {status.supabase.hasData ? 'Data access verified' : 'No data access'}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium">Connection Failed</h3>
                <p className="mt-1 text-sm text-red-600">{status.supabase?.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* GHL Status */}
        <div>
          <div className="flex items-center mb-4">
            <Building2 className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-medium">Go High Level Integration</h3>
          </div>

          {status.ghl?.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium">Integration Successful</h3>
                <ul className="mt-2 space-y-1 text-sm text-green-700">
                  <li>✓ Sub-account configured</li>
                  <li>✓ Client sync working</li>
                  <li>✓ Tag management working</li>
                </ul>
                {status.ghl.details && (
                  <pre className="mt-2 text-xs bg-green-100 p-2 rounded">
                    {JSON.stringify(status.ghl.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium">Integration Failed</h3>
                <p className="mt-1 text-sm text-red-600">{status.ghl?.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}