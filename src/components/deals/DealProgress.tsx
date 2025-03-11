import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DealChecklist } from './DealChecklist';
import { DealMilestones } from './DealMilestones';
import { useDealChecklists } from '../../hooks/useDealChecklists';
import { useDealMilestones } from '../../hooks/useDealMilestones';
import { debug, Category } from '../../lib/debug';

interface Props {
  dealId: string;
}

export function DealProgress({ dealId }: Props) {
  const [activeTab, setActiveTab] = useState('checklist');
  const { 
    checklists,
    loading: checklistsLoading,
    error: checklistsError,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklist
  } = useDealChecklists(dealId);

  const {
    milestones,
    loading: milestonesLoading,
    error: milestonesError,
    addMilestone,
    updateMilestone,
    deleteMilestone
  } = useDealMilestones(dealId);

  const handleChecklistToggle = async (itemId: string) => {
    try {
      await toggleChecklist(itemId);
    } catch (err) {
      debug.logError(Category.API, 'Error toggling checklist item', {}, err);
    }
  };

  const handleAddChecklist = async (data: any) => {
    try {
      await addChecklist(data);
    } catch (err) {
      debug.logError(Category.API, 'Error adding checklist item', {}, err);
      throw err;
    }
  };

  const handleDeleteChecklist = async (itemId: string) => {
    try {
      await deleteChecklist(itemId);
    } catch (err) {
      debug.logError(Category.API, 'Error deleting checklist item', {}, err);
      throw err;
    }
  };

  const handleAddMilestone = async (data: any) => {
    try {
      await addMilestone(data);
    } catch (err) {
      debug.logError(Category.API, 'Error adding milestone', {}, err);
      throw err;
    }
  };

  const handleUpdateMilestone = async (id: string, data: any) => {
    try {
      await updateMilestone(id, data);
    } catch (err) {
      debug.logError(Category.API, 'Error updating milestone', {}, err);
      throw err;
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteMilestone(id);
    } catch (err) {
      debug.logError(Category.API, 'Error deleting milestone', {}, err);
      throw err;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'checklist'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'milestones'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Milestones
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'checklist' && (
          <DealChecklist
            dealId={dealId}
            items={checklists}
            onToggleItem={handleChecklistToggle}
            onAddItem={handleAddChecklist}
            onDeleteItem={handleDeleteChecklist}
            loading={checklistsLoading}
          />
        )}

        {activeTab === 'milestones' && (
          <DealMilestones
            dealId={dealId}
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            loading={milestonesLoading}
          />
        )}
      </div>
    </div>
  );
}