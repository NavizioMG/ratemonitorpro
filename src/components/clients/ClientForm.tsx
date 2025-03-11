import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { debug, Category } from '../../lib/debug';

const COMPONENT_ID = 'ClientForm';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  current_rate: string;
  target_rate: string;
  loan_amount: string;
  term_years: number;
  lender: string;
  start_date: string;
  notes: string;
}

interface Props {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  initialData?: any;
  title?: string;
}

export function ClientForm({
  onSubmit,
  onCancel,
  loading,
  error,
  initialData,
  title = 'Add New Client'
}: Props) {
  const [formData, setFormData] = useState<FormData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zip: initialData?.zip || '',
    current_rate: initialData?.mortgages?.[0]?.current_rate?.toString() || '',
    target_rate: initialData?.mortgages?.[0]?.target_rate?.toString() || '',
    loan_amount: initialData?.mortgages?.[0]?.loan_amount?.toString() || '',
    term_years: initialData?.mortgages?.[0]?.term_years || 30,
    lender: initialData?.mortgages?.[0]?.lender || '',
    start_date: initialData?.mortgages?.[0]?.start_date || new Date().toISOString().split('T')[0],
    notes: initialData?.mortgages?.[0]?.notes || ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.lender.trim()) errors.lender = 'Lender is required';

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Phone format (optional but must be valid if provided)
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }

    // Rate validation
    const currentRate = parseFloat(formData.current_rate);
    const targetRate = parseFloat(formData.target_rate);

    if (isNaN(currentRate) || currentRate < 0 || currentRate > 15) {
      errors.current_rate = 'Rate must be between 0 and 15';
    }
    if (isNaN(targetRate) || targetRate < 0 || targetRate > 15) {
      errors.target_rate = 'Rate must be between 0 and 15';
    }

    // Loan amount validation
    const loanAmount = parseFloat(formData.loan_amount);
    if (isNaN(loanAmount) || loanAmount <= 0) {
      errors.loan_amount = 'Please enter a valid loan amount';
    }

    // ZIP code validation (if provided)
    if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      errors.zip = 'Invalid ZIP code format';
    }

    // Start date validation
    if (!formData.start_date) {
      errors.start_date = 'Closed date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      debug.logWarning(Category.API, 'Form validation failed', { errors: formErrors }, COMPONENT_ID);
      return;
    }

    try {
      const submissionData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        current_rate: parseFloat(formData.current_rate),
        target_rate: parseFloat(formData.target_rate),
        loan_amount: parseFloat(formData.loan_amount),
        term_years: formData.term_years,
        lender: formData.lender.trim(),
        start_date: formData.start_date,
        notes: formData.notes.trim()
      };

      debug.logInfo(Category.API, 'Submitting client form', { data: submissionData }, COMPONENT_ID);
      await onSubmit(submissionData);
    } catch (err) {
      debug.logError(Category.API, 'Form submission error', {}, err, COMPONENT_ID);
    }
  };

  const handleRateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'current_rate' | 'target_rate') => {
    const value = e.target.value;
    
    // Allow empty input
    if (!value) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }

    // Only allow digits and one decimal point
    const regex = /^\d*\.?\d{0,3}$/;
    if (regex.test(value) && parseFloat(value) <= 15) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLoanAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormData(prev => ({ ...prev, loan_amount: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.first_name ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.last_name ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.email ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.phone ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={e => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                    formErrors.zip ? 'border-red-300' : ''
                  }`}
                  disabled={loading}
                />
                {formErrors.zip && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.zip}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loan Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.current_rate}
                onChange={e => handleRateInput(e, 'current_rate')}
                placeholder="e.g. 6.125"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.current_rate ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.current_rate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.current_rate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={formData.target_rate}
                onChange={e => handleRateInput(e, 'target_rate')}
                placeholder="e.g. 5.875"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.target_rate ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.target_rate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.target_rate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formData.loan_amount}
                onChange={handleLoanAmountInput}
                placeholder="e.g. 450000"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.loan_amount ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.loan_amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.loan_amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Term (Years) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.term_years}
                onChange={e => setFormData(prev => ({ ...prev, term_years: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                disabled={loading}
              >
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={30}>30 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lender <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lender}
                onChange={e => setFormData(prev => ({ ...prev, lender: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.lender ? 'border-red-300' : ''
                }`}
                disabled={loading}
                placeholder="Enter lender name"
              />
              {formErrors.lender && (
                <p className="mt-1 text-sm text-red-600">{formErrors.lender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Closed Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary ${
                  formErrors.start_date ? 'border-red-300' : ''
                }`}
                disabled={loading}
              />
              {formErrors.start_date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.start_date}</p>
              )}
            </div>
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
            placeholder="Add any additional notes here"
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
            'Save Client'
          )}
        </button>
      </div>
    </form>
  );
}