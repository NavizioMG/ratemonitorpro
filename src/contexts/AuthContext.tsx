import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Session } from '../types/database';
import { debug, Category } from '../lib/debug';
import { createGHLSubAccount } from '../services/gohighlevel';

const COMPONENT_ID = 'AuthContext';
const AUTH_TIMEOUT = 10000; // 10 seconds

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const initAttemptRef = useRef(0);

  const ensureProfile = async (userId: string, userData?: { fullName?: string; companyName?: string; phone?: string }) => {
    try {
      // Wait a short time to ensure auth user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile && userData) {
        debug.logInfo(Category.AUTH, 'Creating new profile', { userId }, COMPONENT_ID);
        
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

        // Create GHL sub-account
        try {
          debug.logInfo(Category.AUTH, 'Creating GHL sub-account', { 
            userId,
            companyName: userData.companyName
          }, COMPONENT_ID);

          const ghlData = await createGHLSubAccount(
            userId,
            userData.companyName || 'New Business'
          );

          debug.logInfo(Category.AUTH, 'GHL sub-account created successfully', { 
            ghlData 
          }, COMPONENT_ID);
        } catch (ghlError) {
          debug.logError(Category.AUTH, 'Failed to create GHL sub-account', {
            error: ghlError.message
          }, ghlError, COMPONENT_ID);
          // Don't throw error - allow signup to succeed even if GHL setup fails
        }

        return profile;
      }

      return existingProfile;
    } catch (error) {
      debug.logError(Category.AUTH, 'Error ensuring profile exists', { userId }, error, COMPONENT_ID);
      throw error;
    }
  };

  useEffect(() => {
    debug.logInfo(Category.LIFECYCLE, 'AuthProvider mounted', {}, COMPONENT_ID);
    let mounted = true;

    async function initializeAuth() {
      try {
        debug.startMark('auth-init');
        debug.logInfo(Category.AUTH, 'Starting auth initialization', {
          attempt: initAttemptRef.current + 1
        }, COMPONENT_ID);
        
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

        initTimeoutRef.current = setTimeout(() => {
          if (mounted && loading) {
            debug.logWarning(Category.AUTH, 'Auth initialization timed out', {
              attempt: initAttemptRef.current
            }, COMPONENT_ID);
            
            if (initAttemptRef.current < 3) {
              initAttemptRef.current++;
              initializeAuth();
            } else {
              setLoading(false);
              setSession(null);
            }
          }
        }, AUTH_TIMEOUT);

        const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!mounted) return;

        if (authSession?.user) {
          debug.logInfo(Category.AUTH, 'Found valid auth session', {
            userId: authSession.user.id,
            email: authSession.user.email
          }, COMPONENT_ID);

          const profile = await ensureProfile(authSession.user.id);

          debug.endMark('auth-init', Category.AUTH);

          if (!mounted) return;

          setSession({
            user: {
              id: authSession.user.id,
              email: authSession.user.email!,
            },
            profile: profile || null,
          });
        } else {
          debug.logInfo(Category.AUTH, 'No active session found', {}, COMPONENT_ID);
          setSession(null);
        }

        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
      } catch (error) {
        debug.logError(Category.AUTH, 'Auth initialization error', {
          attempt: initAttemptRef.current
        }, error, COMPONENT_ID);
        
        if (mounted) {
          if (initAttemptRef.current < 3) {
            initAttemptRef.current++;
            setTimeout(initializeAuth, 1000 * Math.pow(2, initAttemptRef.current));
          } else {
            setSession(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      debug.logInfo(Category.AUTH, 'Auth state change', { 
        event, 
        userId: authSession?.user?.id 
      }, COMPONENT_ID);

      if (!mounted) return;

      if (!authSession) {
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await ensureProfile(authSession.user.id);

        if (!mounted) return;

        setSession({
          user: {
            id: authSession.user.id,
            email: authSession.user.email!,
          },
          profile: profile || null,
        });
      } catch (error) {
        debug.logError(Category.AUTH, 'Error in auth change handler', {}, error, COMPONENT_ID);
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      debug.logInfo(Category.LIFECYCLE, 'AuthProvider cleanup', {
        hadInitTimeout: !!initTimeoutRef.current
      }, COMPONENT_ID);
      
      mounted = false;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [loading]);

  const signIn = async (email: string, password: string) => {
    try {
      debug.startMark('sign-in');
      debug.logInfo(Category.AUTH, 'Starting sign in process', { email }, COMPONENT_ID);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      debug.endMark('sign-in', Category.AUTH);

      if (error) throw error;

      if (data.user) {
        debug.logInfo(Category.AUTH, 'Sign in successful', {
          userId: data.user.id,
          email: data.user.email
        }, COMPONENT_ID);

        const profile = await ensureProfile(data.user.id);

        setSession({
          user: {
            id: data.user.id,
            email: data.user.email!,
          },
          profile: profile || null,
        });
      }
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign in process failed', {}, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string, phone?: string) => {
    try {
      debug.startMark('sign-up');
      debug.logInfo(Category.AUTH, 'Starting sign up process', { email }, COMPONENT_ID);
      setLoading(true);

      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
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
          email: user.email
        }, COMPONENT_ID);

        const profile = await ensureProfile(user.id, { fullName, companyName, phone });

        setSession({
          user: {
            id: user.id,
            email: user.email!,
          },
          profile: profile || null,
        });

        debug.logInfo(Category.AUTH, 'Sign up completed successfully', {
          userId: user.id
        }, COMPONENT_ID);
      }

      debug.endMark('sign-up', Category.AUTH);
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign up process failed', {}, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      debug.startMark('sign-out');
      debug.logInfo(Category.AUTH, 'Starting sign out process', {}, COMPONENT_ID);
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      debug.endMark('sign-out', Category.AUTH);

      if (error) throw error;
      
      debug.logInfo(Category.AUTH, 'Sign out successful', {}, COMPONENT_ID);
      setSession(null);
    } catch (error) {
      debug.logError(Category.AUTH, 'Sign out process failed', {}, error, COMPONENT_ID);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
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