import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Plus, 
  Filter, 
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { useDealStages } from '../hooks/useDealStages';
import { DragDropPipeline } from '../components/deals/DragDropPipeline';
import { DealForm } from '../components/deals/DealForm';
import { DealProgress } from '../components/deals/DealProgress';
import { debug, Category } from '../lib/debug';

export function Pipeline() {
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [addDealLoading, setAddDealLoading] = useState(false);
  const [addDealError, setAddDealError] = useState<string | null>(null);
  
  const { 
    deals, 
    loading: dealsLoading, 
    error: dealsError,
    fetchDeals,
    addDeal,
    updateDeal 
  } = useDeals();

  const { 
    stages, 
    loading: stagesLoading, 
    error: stagesError,
    fetchStages 
  } = useDealStages();

  useEffect(() => {
    fetchDeals();
    fetchStages();
  }, [fetchDeals, fetchStages]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      return;
    }

    try {
      await updateDeal(draggableId, { stage_id: destination.droppableId });
      
      debug.logInfo(Category.UI, 'Deal stage updated', {
        dealId: draggableId,
        newStage: destination.droppableId
      });
    } catch (err) {
      debug.logError(Category.UI, 'Error updating deal stage', {}, err);
    }
  };

  const handleAddDeal = async (formData: any) => {
    try {
      setAddDealLoading(true);
      setAddDealError(null);

      await addDeal({
        ...formData,
        stage_id: stages[0]?.id // Start in first stage
      });

      setShowAddDeal(false);
    } catch (err) {
      debug.logError(Category.API, 'Error adding deal', {}, err);
      setAddDealError('Failed to add deal');
    } finally {
      setAddDealLoading(false);
    }
  };

  if (dealsLoading || stagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dealsError || stagesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">
                {dealsError || stagesError}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your loan pipeline from lead to funding
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={() => setShowAddDeal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </button>
        </div>
      </div>

      <div className="mt-8">
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Total Pipeline</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  ${deals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Win Rate</h3>
                <p className="text-2xl font-semibold text-gray-900">68%</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Avg. Close Time</h3>
                <p className="text-2xl font-semibold text-gray-900">45 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">At Risk</h3>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline View */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Pipeline Stages</h2>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>

            <DragDropPipeline
              stages={stages}
              deals={deals}
              onDragEnd={handleDragEnd}
              onDealClick={setSelectedDeal}
              selectedDealId={selectedDeal?.id}
            />
          </div>
        </div>

        {/* Deal Details */}
        {selectedDeal && (
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {selectedDeal.client.first_name[0]}{selectedDeal.client.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedDeal.client.first_name} {selectedDeal.client.last_name}
                      </h2>
                      <div className="mt-1 flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="ml-1 text-sm text-gray-500">
                          ${selectedDeal.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <DealProgress dealId={selectedDeal.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DealForm
              onSubmit={handleAddDeal}
              onCancel={() => {
                setShowAddDeal(false);
                setAddDealError(null);
              }}
              loading={addDealLoading}
              error={addDealError}
              clients={[]}
              title="New Deal"
            />
          </div>
        </div>
      )}
    </div>
  );
}