import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Session } from '../types/database';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'AuthContext';
const AUTH_TIMEOUT = 10000; // 10 seconds

// Generate unique tab ID to prevent state conflicts
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [tabId] = useState(TAB_ID);
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const initAttemptRef = useRef(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const ensureProfile = async (
    userId: string,
    userData?: { fullName?: string; companyName?: string; phone?: string; email?: string }
  ) => {
    try {
      // Wait a short time to ensure auth user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
  
      if (!existingProfile && userData) {
        debug.logInfo(Category.AUTH, 'Creating new profile', { userId, tabId }, COMPONENT_ID);
  
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            full_name: userData.fullName || '',
            company_name: userData.companyName || '',
            phone: userData.phone || null,
          }])
          .select()
          .single();
  
        if (profileError) throw profileError;
  
        // ✅ SAFER: Use email from userData, fallback to session
        const email = userData.email || session?.user?.email;
  
        // Call secure Netlify backend function to create GHL contact
        try {
          debug.logInfo(Category.AUTH, 'Creating GHL sub-account via Netlify function', {
            fullName: userData.fullName,
            email,
            phone: userData.phone,
            companyName: userData.companyName,
            tabId
          }, COMPONENT_ID);
  
          const response = await fetch('/.netlify/functions/add-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: userData.fullName,
              email,
              phone: userData.phone,
              companyName: userData.companyName,
            }),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            debug.logError(Category.API, 'GHL backend function failed', { result, tabId }, null, COMPONENT_ID);
          } else {
            debug.logInfo(Category.API, 'GHL contact created successfully via backend', { result, tabId }, COMPONENT_ID);
          }
        } catch (error) {
          debug.logError(Category.AUTH, 'Failed to call backend GHL function', { error, tabId }, error, COMPONENT_ID);
        }
  
        return profile;
      }
  
      return existingProfile;
    } catch (error) {
      debug.logError(Category.AUTH, 'Error ensuring profile exists', { userId, tabId }, error, COMPONENT_ID);
      throw error;
    }
  };

  // Setup automatic token refresh
  const setupTokenRefresh = (authSession: any) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    if (!authSession?.expires_at) return;

    const expiresAt = authSession.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000); // Refresh 5 min before expiry, min 1 min

    debug.logInfo(Category.AUTH, 'Setting up token refresh', {
      expiresAt: new Date(expiresAt).toISOString(),
      refreshIn: Math.round(refreshTime / 1000) + 's',
      tabId
    }, COMPONENT_ID);

    refreshIntervalRef.current = setTimeout(async () => {
      try {
        debug.logInfo(Category.AUTH, 'Refreshing session token', { tabId }, COMPONENT_ID);
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (error) {
          debug.logError(Category.AUTH, 'Token refresh failed', { tabId }, error, COMPONENT_ID);
          // Don't sign out immediately, let the auth state change handler deal with it
          return;
        }

        if (refreshedSession) {
          debug.logInfo(Category.AUTH, 'Token refreshed successfully', { tabId }, COMPONENT_ID);
          setupTokenRefresh(refreshedSession); // Setup next refresh
        }
      } catch (error) {
        debug.logError(Category.AUTH, 'Token refresh error', { tabId }, error, COMPONENT_ID);
      }
    }, refreshTime);
  };

  // Main authentication initialization useEffect
  useEffect(() => {
    debug.logInfo(Category.LIFECYCLE, 'AuthProvider mounted', { tabId }, COMPONENT_ID);
    let mounted = true;

    // Check if another tab is already handling auth
    const existingTabId = localStorage.getItem('active_auth_tab');
    const isMainTab = !existingTabId || existingTabId === tabId;
    
    if (isMainTab) {
      localStorage.setItem('active_auth_tab', tabId);
      debug.logInfo(Category.AUTH, 'This tab is handling auth initialization', { tabId }, COMPONENT_ID);
    } else {
      debug.logInfo(Category.AUTH, 'Another tab is handling auth, using existing session', { 
        tabId, 
        activeTab: existingTabId 
      }, COMPONENT_ID);
    }

    async function initializeAuth() {
      try {
        debug.startMark('auth-init');
        debug.logInfo(Category.AUTH, 'Starting auth initialization', {
          attempt: initAttemptRef.current + 1,
          tabId,
          isMainTab
        }, COMPONENT_ID);
        
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

        // Only set timeout for main tab
        if (isMainTab) {
          initTimeoutRef.current = setTimeout(() => {
            if (mounted && !initialLoadComplete) {
              debug.logWarning(Category.AUTH, 'Auth initialization timed out', {
                attempt: initAttemptRef.current,
                tabId
              }, COMPONENT_ID);
              
              if (initAttemptRef.current < 3) {
                initAttemptRef.current++;
                initializeAuth();
              } else {
                setLoading(false);
                setInitialLoadComplete(true);
                setSession(null);
              }
            }
          }, AUTH_TIMEOUT);
        }

        const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!mounted) return;

        if (authSession?.user) {
          debug.logInfo(Category.AUTH, 'Found valid auth session', {
            userId: authSession.user.id,
            email: authSession.user.email,
            expiresAt: authSession.expires_at ? new Date(authSession.expires_at * 1000).toISOString() : 'unknown',
            tabId
          }, COMPONENT_ID);

          // Only ensure profile on main tab to prevent conflicts
          let profile = null;
          if (isMainTab) {
            profile = await ensureProfile(authSession.user.id);
          } else {
            // Secondary tabs just fetch existing profile
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authSession.user.id)
              .maybeSingle();
            profile = existingProfile;
          }

          debug.endMark('auth-init', Category.AUTH);

          if (!mounted) return;

          setSession({
            user: {
              id: authSession.user.id,
              email: authSession.user.email!,
            },
            profile: profile || null,
          });

          // Only main tab handles token refresh
          if (isMainTab) {
            setupTokenRefresh(authSession);
          }
        } else {
          debug.logInfo(Category.AUTH, 'No active session found', { tabId }, COMPONENT_ID);
          setSession(null);
        }

        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
      } catch (error) {
        debug.logError(Category.AUTH, 'Auth initialization error', {
          attempt: initAttemptRef.current,
          tabId
        }, error, COMPONENT_ID);
        
        if (mounted) {
          if (initAttemptRef.current < 3 && isMainTab) {
            initAttemptRef.current++;
            setTimeout(initializeAuth, 1000 * Math.pow(2, initAttemptRef.current));
          } else {
            setSession(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      debug.logInfo(Category.AUTH, 'Auth state change', { 
        event, 
        userId: authSession?.user?.id,
        tabId
      }, COMPONENT_ID);

      if (!mounted) return;

      // Only set loading to true for initial load or explicit auth actions
      if (!initialLoadComplete && event !== 'INITIAL_SESSION') {
        setLoading(true);
      }

      if (!authSession) {
        setSession(null);
        if (refreshIntervalRef.current && isMainTab) {
          clearInterval(refreshIntervalRef.current);
        }
        // Don't set loading to false immediately for sign out
        if (event === 'SIGNED_OUT') {
          setLoading(false);
        }
        return;
      }

      try {
        // Only ensure profile on main tab or for explicit auth events
        let profile = null;
        if (isMainTab || event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          profile = await ensureProfile(authSession.user.id);
        } else {
          // Secondary tabs just fetch existing profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authSession.user.id)
            .maybeSingle();
          profile = existingProfile;
        }

        if (!mounted) return;

        setSession({
          user: {
            id: authSession.user.id,
            email: authSession.user.email!,
          },
          profile: profile || null,
        });

        // Setup token refresh for new/refreshed sessions (main tab only)
        if (isMainTab && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setupTokenRefresh(authSession);
        }
      } catch (error) {
        debug.logError(Category.AUTH, 'Error in auth change handler', { tabId }, error, COMPONENT_ID);
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted && !initialLoadComplete) {
          setLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      debug.logInfo(Category.LIFECYCLE, 'AuthProvider cleanup', {
        hadInitTimeout: !!initTimeoutRef.current,
        hadRefreshInterval: !!refreshIntervalRef.current,
        tabId,
        wasMainTab: isMainTab
      }, COMPONENT_ID);
      
      // Clean up tab ID if this was the main tab
      if (isMainTab && localStorage.getItem('active_auth_tab') === tabId) {
        localStorage.removeItem('active_auth_tab');
      }
      
      mounted = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (refreshIntervalRef.current && isMainTab) {
        clearInterval(refreshIntervalRef.current);
      }
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  // Multi-tab synchronization effect
  useEffect(() => {
    // Add random delay to prevent all tabs from making requests simultaneously
    const tabDelay = Math.random() * 1000; // 0-1 second random delay
    
    const delayedSetup = setTimeout(() => {
      
      // Listen for storage events (token changes in other tabs)
      const handleStorageChange = async (e: StorageEvent) => {
        // Supabase uses localStorage for session storage
        if (e.key?.includes('supabase.auth.token') || e.key === 'supabase.auth.token') {
          debug.logInfo(Category.AUTH, 'Token changed in another tab, refreshing session', { tabId }, COMPONENT_ID);
          
          // Add small delay to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 200));
          
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              debug.logError(Category.AUTH, 'Error refreshing session from storage change', { tabId }, error, COMPONENT_ID);
              return;
            }

            if (!mountedRef.current) return;

            if (session?.user) {
              // Just fetch existing profile for tab sync
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              setSession({
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                },
                profile: existingProfile || null,
              });
              
              // Only main tab handles token refresh
              const isMainTab = localStorage.getItem('active_auth_tab') === tabId;
              if (isMainTab) {
                setupTokenRefresh(session);
              }
            } else {
              setSession(null);
              if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
              }
            }
          } catch (error) {
            debug.logError(Category.AUTH, 'Error handling storage change', { tabId }, error, COMPONENT_ID);
          }
        }
      };

      // Listen for focus events (tab becomes active)
      const handleFocus = async () => {
        if (!session) return;
        
        debug.logInfo(Category.AUTH, 'Tab focused, checking session validity', { tabId }, COMPONENT_ID);
        
        // Add small delay to prevent immediate API calls when switching tabs
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (error || !currentSession) {
            debug.logWarning(Category.AUTH, 'Session invalid on focus, signing out', { tabId }, COMPONENT_ID);
            setSession(null);
            if (refreshIntervalRef.current) {
              clearInterval(refreshIntervalRef.current);
            }
            return;
          }

          // Check if token is different (updated in another tab)
          if (currentSession.access_token !== session.user.id) {
            debug.logInfo(Category.AUTH, 'Session updated in another tab, refreshing', { tabId }, COMPONENT_ID);
            
            // Just fetch existing profile for tab sync
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle();
            
            setSession({
              user: {
                id: currentSession.user.id,
                email: currentSession.user.email!,
              },
              profile: existingProfile || null,
            });
            
            // Only main tab handles token refresh
            const isMainTab = localStorage.getItem('active_auth_tab') === tabId;
            if (isMainTab) {
              setupTokenRefresh(currentSession);
            }
          }
        } catch (error) {
          debug.logError(Category.AUTH, 'Error checking session on focus', { tabId }, error, COMPONENT_ID);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleFocus);
      };
      
    }, tabDelay);

    return () => {
      clearTimeout(delayedSetup);
    };
  }, [session, tabId]);

  const signIn = async (email: string, password: string) => {
    try {
      debug.startMark('sign-in');
      debug.logInfo(Category.AUTH, 'Starting sign in process', { email, tabId }, COMPONENT_ID);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      debug.endMark('sign-in', Category.AUTH);

      if (error) throw error;

      if (data.user && data.session) {
        debug.logInfo(Category.AUTH, 'Sign in successful', {
          userId: data.user.id,
          email: data.user.email,
          tabId
        }, COMPONENT_ID);

        const profile = await ensureProfile(data.user.id);

        setSession({
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          profile: profile || null,
        });

        // Setup token refresh for new session
        setupTokenRefresh(data.session);
        
        // Mark this tab as the main auth tab
        localStorage.setItem('active_auth_tab', tabId);
      }
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign in process failed', { tabId }, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string, phone?: string) => {
    try {
      debug.startMark('sign-up');
      debug.logInfo(Category.AUTH, 'Starting sign up process', { email, tabId }, COMPONENT_ID);
      setLoading(true);

      const { data: { user, session: authSession }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            phone: phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (user) {
        debug.logInfo(Category.AUTH, 'User created successfully', {
          userId: user.id,
          email: user.email,
          tabId
        }, COMPONENT_ID);

        const profile = await ensureProfile(user.id, { fullName, companyName, phone, email });

        setSession({
          user: {
            id: user.id,
            email: user.email!,
          },
          profile: profile || null,
        });

        // Setup token refresh if we have a session
        if (authSession) {
          setupTokenRefresh(authSession);
        }
        
        // Mark this tab as the main auth tab
        localStorage.setItem('active_auth_tab', tabId);

        debug.logInfo(Category.AUTH, 'Sign up completed successfully', {
          userId: user.id,
          tabId
        }, COMPONENT_ID);
      }

      debug.endMark('sign-up', Category.AUTH);
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign up process failed', { tabId }, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      debug.startMark('sign-out');
      debug.logInfo(Category.AUTH, 'Starting sign out process', { tabId }, COMPONENT_ID);
      setLoading(true);
      
      // Clear refresh interval before signing out
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Clear main tab designation
      if (localStorage.getItem('active_auth_tab') === tabId) {
        localStorage.removeItem('active_auth_tab');
      }
      
      const { error } = await supabase.auth.signOut();
      
      debug.endMark('sign-out', Category.AUTH);

      if (error) throw error;
      
      debug.logInfo(Category.AUTH, 'Sign out successful', { tabId }, COMPONENT_ID);
      setSession(null);
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign out process failed', { tabId }, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      isAuthenticated: !!session?.user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};