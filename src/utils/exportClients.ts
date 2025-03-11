import { Client } from '../types/database';

export function exportClientsToCSV(clients: Client[]): void {
  // Prepare CSV data
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Current Rate',
    'Target Rate',
    'Loan Amount',
    'Term Years',
    'Lender',
    'Notes'
  ];

  const rows = clients.map(client => [
    client.first_name,
    client.last_name,
    client.email,
    client.phone || '',
    client.mortgages?.[0]?.current_rate || '',
    client.mortgages?.[0]?.target_rate || '',
    client.mortgages?.[0]?.loan_amount || '',
    client.mortgages?.[0]?.term_years || '',
    client.mortgages?.[0]?.lender || '',
    client.mortgages?.[0]?.notes || ''
  ]);

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}