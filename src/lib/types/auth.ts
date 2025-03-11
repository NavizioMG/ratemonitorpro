export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: AuthUser | null;
  profile: Profile | null;
}

export interface AuthError {
  message: string;
  status?: number;
}