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