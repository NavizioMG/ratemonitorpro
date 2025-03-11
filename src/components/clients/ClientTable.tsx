import React, { useState, useEffect, useRef } from 'react';
import { Client } from '../../types/database';
import { RateStatusBadge } from '../RateStatusBadge';
import { 
  ArrowUpDown, 
  Pencil, 
  Trash2,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  DollarSign,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { debug, Category } from '../../lib/debug';

type SortField = 'name' | 'email' | 'current_rate' | 'target_rate' | 'loan_amount' | 'lender';
type SortDirection = 'asc' | 'desc';

interface Props {
  clients: Client[];
  rateStatuses: Map<string, {
    isTargetMet: boolean;
    savingsAmount: number;
    percentageToTarget: number;
  }>;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onSelect: (clientId: string | null) => void;
  selectedClient: string | null;
}

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}

export function ClientTable({ 
  clients, 
  rateStatuses,
  onEdit, 
  onDelete,
  onSelect,
  selectedClient
}: Props) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        onSelect(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSelect]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name':
        return direction * (`${a.first_name} ${a.last_name}`).localeCompare(`${b.first_name} ${b.last_name}`);
      case 'email':
        return direction * a.email.localeCompare(b.email);
      case 'current_rate':
        return direction * ((a.mortgages?.[0]?.current_rate || 0) - (b.mortgages?.[0]?.current_rate || 0));
      case 'target_rate':
        return direction * ((a.mortgages?.[0]?.target_rate || 0) - (b.mortgages?.[0]?.target_rate || 0));
      case 'loan_amount':
        return direction * ((a.mortgages?.[0]?.loan_amount || 0) - (b.mortgages?.[0]?.loan_amount || 0));
      case 'lender':
        return direction * ((a.mortgages?.[0]?.lender || '').localeCompare(b.mortgages?.[0]?.lender || ''));
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`h-4 w-4 inline-block ml-1 ${
        sortField === field ? 'text-primary' : 'text-gray-400'
      }`}
    />
  );

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Clients Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first client
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={tableRef} className="bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('current_rate')}
              >
                Current Rate <SortIcon field="current_rate" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('target_rate')}
              >
                Target Rate <SortIcon field="target_rate" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('loan_amount')}
              >
                Loan Amount <SortIcon field="loan_amount" />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lender')}
              >
                Lender <SortIcon field="lender" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.map((client) => {
              const mortgage = client.mortgages?.[0];
              const status = rateStatuses.get(client.id);
              const isExpanded = selectedClient === client.id;

              if (!mortgage || !status) {
                debug.logWarning(Category.UI, 'Missing mortgage or status data', { 
                  clientId: client.id,
                  hasMortgage: !!mortgage,
                  hasStatus: !!status
                });
                return null;
              }

              // Calculate monthly payments
              const currentPayment = calculateMonthlyPayment(
                mortgage.loan_amount,
                mortgage.current_rate,
                mortgage.term_years
              );

              const newPayment = calculateMonthlyPayment(
                mortgage.loan_amount,
                mortgage.target_rate,
                mortgage.term_years
              );

              const monthlySavings = currentPayment - newPayment;
              const annualSavings = monthlySavings * 12;

              return (
                <React.Fragment key={client.id}>
                  <tr 
                    onClick={() => onSelect(isExpanded ? null : client.id)}
                    className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {client.first_name[0]}{client.last_name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRate(mortgage.current_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRate(mortgage.target_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(mortgage.loan_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                        {mortgage.lender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RateStatusBadge
                        isTargetMet={status.isTargetMet}
                        percentageToTarget={status.percentageToTarget}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(client.id);
                          }}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(client.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-6 py-4">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                            <dl className="mt-2 space-y-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <dd className="text-sm text-gray-900">{client.email}</dd>
                              </div>
                              {client.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <dd className="text-sm text-gray-900">{client.phone}</dd>
                                </div>
                              )}
                              {client.address && (
                                <div className="flex items-start">
                                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                                  <dd className="text-sm text-gray-900">
                                    {client.address}<br />
                                    {client.city}, {client.state} {client.zip}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Payment Details</h4>
                            <dl className="mt-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-500">Current Monthly Payment:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {formatCurrency(currentPayment)}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-500">Payment at Target Rate:</dt>
                                <dd className="text-sm font-medium text-gray-900">
                                  {formatCurrency(newPayment)}
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-500">Monthly Savings:</dt>
                                <dd className="text-sm font-medium text-green-600">
                                  <div className="flex items-center">
                                    <ArrowDown className="h-4 w-4 mr-1" />
                                    {formatCurrency(monthlySavings)}
                                  </div>
                                </dd>
                              </div>
                              <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-500">Annual Savings:</dt>
                                <dd className="text-sm font-medium text-green-600">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {formatCurrency(annualSavings)}
                                  </div>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}