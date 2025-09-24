import { useState } from 'react';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { useClients } from '../hooks/useClients';
import { useRateHistory } from '../hooks/useRateHistory';
import { useRateCalculations } from '../hooks/useRateCalculations';
import { ClientForm } from '../components/clients/ClientForm';
import { ClientTable } from '../components/clients/ClientTable';
import { ClientFormData } from '../types/database';
import { useToast } from '../components/ui/Toast';
import { debug, Category } from '../lib/debug';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const COMPONENT_ID = 'MortgageClients';

export function MortgageClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const { clients, loading: clientsLoading, error: clientsError, refreshClients } = useClients();
  const { rateHistory } = useRateHistory();
  const [filterOpen, setFilterOpen] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [addingClientLoading, setAddingClientLoading] = useState(false);
  const [addClientError, setAddClientError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();
  const { session } = useAuth();

  // Get current market rate from rate history
  const currentMarketRate = rateHistory[0]?.rate_value || 0;

  // Calculate rate statuses for all clients
  const { rateStatuses } = useRateCalculations(clients, currentMarketRate);

  const filteredClients = clients?.filter(client => 
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddClient = async (formData: ClientFormData) => {
    if (!session?.user?.id) {
      setAddClientError('You must be logged in to add clients');
      return;
    }

    try {
      debug.logInfo(Category.DATABASE, 'Starting client creation', { formData }, COMPONENT_ID);
      setAddingClientLoading(true);
      setAddClientError(null);

      // First, insert the client with address fields
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          broker_id: session.user.id,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim()
        })
        .select()
        .single();

      if (clientError) {
        debug.logError(Category.DATABASE, 'Error creating client', {}, clientError, COMPONENT_ID);
        throw new Error('Failed to create client');
      }

      if (!clientData?.id) {
        throw new Error('No client ID returned');
      }

      debug.logInfo(Category.DATABASE, 'Client created successfully', { clientId: clientData.id }, COMPONENT_ID);

      // Then, insert the mortgage
      const { error: mortgageError } = await supabase
        .from('mortgages')
        .insert({
          client_id: clientData.id,
          current_rate: parseFloat(formData.current_rate.toString()),
          target_rate: parseFloat(formData.target_rate.toString()),
          loan_amount: parseFloat(formData.loan_amount.toString()),
          term_years: formData.term_years,
          lender: formData.lender.trim(),
          notes: formData.notes?.trim() || '',
          start_date: formData.start_date
        });

      if (mortgageError) {
        debug.logError(Category.DATABASE, 'Error creating mortgage', {}, mortgageError, COMPONENT_ID);
        // Clean up the client if mortgage creation fails
        await supabase.from('clients').delete().eq('id', clientData.id);
        throw new Error('Failed to create mortgage');
      }

      setIsAddingClient(false);
      await refreshClients();
      showToast('Client added successfully', 'success');
    } catch (err) {
      debug.logError(Category.DATABASE, 'Error in client creation process', {}, err, COMPONENT_ID);
      setAddClientError(err instanceof Error ? err.message : 'Failed to add client');
      showToast('Failed to add client', 'error');
    } finally {
      setAddingClientLoading(false);
    }
  };

  const handleEditClient = async (formData: ClientFormData) => {
    if (!session?.user?.id || !isEditingClient) return;

    try {
      setAddingClientLoading(true);
      setAddClientError(null);

      // Update client with address fields
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim()
        })
        .eq('id', isEditingClient)
        .eq('broker_id', session.user.id);

      if (clientError) throw clientError;

      const { error: mortgageError } = await supabase
        .from('mortgages')
        .update({
          current_rate: parseFloat(formData.current_rate.toString()),
          target_rate: parseFloat(formData.target_rate.toString()),
          loan_amount: parseFloat(formData.loan_amount.toString()),
          term_years: formData.term_years,
          lender: formData.lender.trim(),
          notes: formData.notes?.trim() || '',
          start_date: formData.start_date
        })
        .eq('client_id', isEditingClient);

      if (mortgageError) throw mortgageError;

      setIsEditingClient(null);
      await refreshClients();
      showToast('Client updated successfully', 'success');
    } catch (err) {
      debug.logError(Category.DATABASE, 'Error updating client', {}, err, COMPONENT_ID);
      setAddClientError('Failed to update client. Please try again.');
      showToast('Failed to update client', 'error');
    } finally {
      setAddingClientLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('broker_id', session?.user?.id);

      if (deleteError) throw deleteError;

      setShowDeleteConfirm(null);
      await refreshClients();
      showToast('Client deleted successfully', 'success');
    } catch (err) {
      debug.logError(Category.DATABASE, 'Error deleting client', {}, err, COMPONENT_ID);
      showToast('Failed to delete client', 'error');
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Mortgage Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your client portfolio and track loan opportunities
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setIsAddingClient(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>

      {clientsError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Clients</h3>
              <p className="text-sm text-red-700 mt-1">{clientsError}</p>
              <button
                onClick={() => refreshClients()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <ClientTable
          clients={filteredClients}
          rateStatuses={rateStatuses}
          onEdit={setIsEditingClient}
          onDelete={setShowDeleteConfirm}
          onSelect={setSelectedClient}
          selectedClient={selectedClient}
        />
      </div>

      {/* Add/Edit Client Modal */}
      {(isAddingClient || isEditingClient) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ClientForm
              onSubmit={isEditingClient ? handleEditClient : handleAddClient}
              onCancel={() => {
                setIsAddingClient(false);
                setIsEditingClient(null);
                setAddClientError(null);
              }}
              loading={addingClientLoading}
              error={addClientError}
              initialData={isEditingClient ? clients.find(c => c.id === isEditingClient) : undefined}
              title={isEditingClient ? 'Edit Client' : 'Add Client'}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900">Delete Client</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}