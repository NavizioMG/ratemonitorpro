export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  broker_id: string;
  created_at: string;
  mortgages?: Mortgage[];
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_rate: number;
  target_rate: number;
  loan_amount: number;
  term_years: number;
  lender: string;
  notes?: string;
}