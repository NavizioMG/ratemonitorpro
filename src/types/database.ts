export interface MortgageRate {
  date: Date;
  type: string;
  value: number;
  termYears: number;
}

export interface RateHistory {
  id: string;
  rate_date: string;
  rate_type: string;
  rate_value: number;
  term_years: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface Session {
  user: AuthUser | null;
  profile: Profile | null;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  broker_id: string;
  created_at: string;
  mortgages?: Mortgage[];
}

export interface Mortgage {
  id: string;
  client_id: string;
  current_rate: number;
  target_rate: number;
  loan_amount: number;
  term_years: number;
  start_date: string;
  lender: string;
  notes?: string;
  created_at: string;
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  current_rate: number;
  target_rate: number;
  loan_amount: number;
  term_years: number;
  lender: string;
  notes?: string;
}