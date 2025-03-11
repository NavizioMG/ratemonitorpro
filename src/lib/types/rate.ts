export interface RateHistory {
  id: string;
  rate_date: string;
  rate_type: string;
  rate_value: number;
  term_years: number;
  created_at: string;
}

export interface MortgageRate {
  date: Date;
  type: string;
  value: number;
  termYears: number;
}