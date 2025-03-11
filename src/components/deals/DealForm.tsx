import React, { useState } from 'react';
import { AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface DealFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  loanAmount: string;
  loanType: 'purchase' | 'refinance' | 'reverse';
  notes?: string;
}

interface Props {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  initialData?: any;
  title?: string;
}

export function DealForm({
  onSubmit,
  onCancel,
  loading,
  error,
  initialData,
  title = 'New Lead'
}: Props) {
  const [formData, setFormData] = useState<DealFormData>({
    clientName: initialData?.clientName || '',
    clientEmail: initialData?.clientEmail || '',
    clientPhone: initialData?.clientPhone || '',
    loanAmount: initialData?.loanAmount?.toString() || '',
    loanType: initialData?.loanType || 'purchase',
    notes: initialData?.notes || ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      errors.clientName = 'Client name is required';
    }

    if (!formData.clientEmail.trim()) {
      errors.clientEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      errors.clientEmail = 'Invalid email format';
    }

    if (!formData.clientPhone.trim()) {
      errors.clientPhone = 'Phone number is required';
    }

    if (!formData.loanAmount.trim()) {
      errors.loanAmount = 'Loan amount is required';
    } else {
      const amount = parseFloat(formData.loanAmount.replace(/[^\d.]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        errors.loanAmount = 'Please enter a valid loan amount';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      debug.logWarning(Category.API, 'Deal form validation failed', { errors: formErrors });
      return;
    }

    try {
      const [firstName, ...lastNameParts] = formData.clientName.trim().split(' ');
      const lastName = lastNameParts.join(' ');

      const submissionData = {
        first_name: firstName,
        last_name: lastName || '[No Last Name]',
        email: formData.clientEmail.trim(),
        phone: formData.clientPhone.trim(),
        loan_amount: parseFloat(formData.loanAmount.replace(/[^\d.]/g, '')),
        loan_type: formData.loanType,
        notes: formData.notes?.trim()
      };

      debug.logInfo(Category.API, 'Submitting deal form', { data: submissionData });
      await onSubmit(submissionData);
    } catch (err) {
      debug.logError(Category.API, 'Deal form submission error', {}, err);
    }
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setFormData(prev => ({ ...prev, loanAmount: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.clientName}
            onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
              formErrors.clientName ? 'border-red-300' : ''
            }`}
            placeholder="Full Name"
            disabled={loading}
          />
          {formErrors.clientName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.clientName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={e => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                formErrors.clientEmail ? 'border-red-300' : ''
              }`}
              disabled={loading}
            />
            {formErrors.clientEmail && (
              <p className="mt-1 text-sm text-red-600">{formErrors.clientEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                formErrors.clientPhone ? 'border-red-300' : ''
              }`}
              disabled={loading}
            />
            {formErrors.clientPhone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.clientPhone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loan Amount <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.loanAmount}
                onChange={handleAmountInput}
                className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.loanAmount ? 'border-red-300' : ''
                }`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {formErrors.loanAmount && (
              <p className="mt-1 text-sm text-red-600">{formErrors.loanAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loan Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.loanType}
              onChange={e => setFormData(prev => ({ ...prev, loanType: e.target.value as any }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              disabled={loading}
            >
              <option value="purchase">Purchase</option>
              <option value="refinance">Refinance</option>
              <option value="reverse">Reverse Mortgage</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Lead'
          )}
        </button>
      </div>
    </form>
  );
}