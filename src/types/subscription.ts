export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  maxClients: number;
  maxAlerts: number;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: Plan;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface BillingHistory {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  invoice_pdf?: string;
}