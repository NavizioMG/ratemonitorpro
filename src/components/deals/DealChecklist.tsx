import { useState } from 'react';
import { 
  CheckSquare, 
  Square,
  Clock,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  dueDate?: string;
  category: string;
  orderPosition: number;
}

interface Props {
  dealId: string;
  items: ChecklistItem[];
  onToggleItem: (itemId: string) => Promise<void>;
  onAddItem: (item: Partial<ChecklistItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  loading?: boolean;
}

export function DealChecklist({ 
  dealId, 
  items, 
  onToggleItem, 
  onAddItem, 
  onDeleteItem,
  loading = false 
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'Documentation',
    dueDate: '',
    isRequired: true
  });
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!newItem.title.trim()) {
        setError('Title is required');
        return;
      }

      await onAddItem({
        ...newItem,
        dealId,
        orderPosition: items.length
      });

      setNewItem({
        title: '',
        description: '',
        category: 'Documentation',
        dueDate: '',
        isRequired: true
      });
      setShowAddForm(false);
    } catch (err) {
      debug.logError(Category.API, 'Error adding checklist item', {}, err);
      setError('Failed to add checklist item');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
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
              value={newItem.title}
              onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newItem.description}
              onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={newItem.category}
                onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={newItem.dueDate}
                onChange={e => setNewItem(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newItem.isRequired}
              onChange={e => setNewItem(prev => ({ ...prev, isRequired: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Required item
            </label>
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
              Add Item
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Checklist Item
        </button>
      )}

      {/* Checklist Items */}
      {categories.map(category => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="font-medium text-gray-900">{category}</h3>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between p-3 rounded-lg border ${
                    item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start flex-1">
                    <button
                      onClick={() => onToggleItem(item.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      {item.completed ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${
                        item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.title}
                        {item.isRequired && (
                          <span className="ml-2 text-xs text-red-500">*</span>
                        )}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      )}
                      {(item.dueDate || item.completedAt) && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          {item.dueDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {item.completedAt && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Completed: {new Date(item.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}