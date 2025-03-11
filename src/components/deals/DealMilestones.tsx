import { useState } from 'react';
import { 
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  completedDate?: string;
  completedBy?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  orderPosition: number;
}

interface Props {
  dealId: string;
  milestones: Milestone[];
  onAddMilestone: (milestone: Partial<Milestone>) => Promise<void>;
  onUpdateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
  loading?: boolean;
}

export function DealMilestones({
  dealId,
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  loading = false
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'pending' as const
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!newMilestone.title.trim()) {
        setError('Title is required');
        return;
      }

      await onAddMilestone({
        ...newMilestone,
        dealId,
        orderPosition: milestones.length
      });

      setNewMilestone({
        title: '',
        description: '',
        targetDate: '',
        status: 'pending'
      });
      setShowAddForm(false);
    } catch (err) {
      debug.logError(Category.API, 'Error adding milestone', {}, err);
      setError('Failed to add milestone');
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Milestone Form */}
      {showAddForm ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMilestone.title}
              onChange={e => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newMilestone.description}
              onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Date
              </label>
              <input
                type="date"
                value={newMilestone.targetDate}
                onChange={e => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={newMilestone.status}
                onChange={e => setNewMilestone(prev => ({ ...prev, status: e.target.value as any }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark"
            >
              Add Milestone
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </button>
      )}

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className={`relative flex items-start space-x-3 ${
              index !== milestones.length - 1 ? 'pb-8' : ''
            }`}
          >
            {/* Connector Line */}
            {index !== milestones.length - 1 && (
              <div className="absolute top-5 left-2.5 -ml-px h-full w-0.5 bg-gray-200"></div>
            )}

            {/* Status Icon */}
            <div className="relative">
              <span className="h-5 w-5 rounded-full flex items-center justify-center ring-8 ring-white">
                {getStatusIcon(milestone.status)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{milestone.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(milestone.status)
                    }`}>
                      {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                    </span>
                    <button
                      onClick={() => onDeleteMilestone(milestone.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {milestone.description && (
                  <p className="mt-2 text-sm text-gray-500">{milestone.description}</p>
                )}

                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  {milestone.targetDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    </div>
                  )}
                  {milestone.completedDate && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Status Update Button */}
                <button
                  onClick={() => {
                    const nextStatus = {
                      pending: 'in_progress',
                      in_progress: 'completed',
                      completed: 'pending'
                    }[milestone.status] || 'pending';
                    
                    onUpdateMilestone(milestone.id, { 
                      status: nextStatus,
                      completedDate: nextStatus === 'completed' ? new Date().toISOString() : undefined
                    });
                  }}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                >
                  Update Status
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}