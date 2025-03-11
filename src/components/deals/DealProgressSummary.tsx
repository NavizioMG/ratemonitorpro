import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  checklists: any[];
  milestones: any[];
  className?: string;
}

export function DealProgressSummary({ checklists, milestones, className = '' }: Props) {
  // Calculate completion percentages
  const completedChecklists = checklists.filter(item => item.completed).length;
  const checklistPercentage = checklists.length > 0 
    ? Math.round((completedChecklists / checklists.length) * 100)
    : 0;

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const milestonePercentage = milestones.length > 0
    ? Math.round((completedMilestones / milestones.length) * 100)
    : 0;

  // Get next pending items
  const nextChecklist = checklists
    .filter(item => !item.completed)
    .sort((a, b) => a.orderPosition - b.orderPosition)[0];

  const nextMilestone = milestones
    .filter(m => m.status !== 'completed')
    .sort((a, b) => a.orderPosition - b.orderPosition)[0];

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">Deal Progress</h3>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-500">Checklist</h4>
              <span className="text-sm font-medium text-gray-900">
                {completedChecklists} / {checklists.length}
              </span>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${checklistPercentage}%` }}
                />
              </div>
            </div>
            {nextChecklist && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Next: {nextChecklist.title}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-500">Milestones</h4>
              <span className="text-sm font-medium text-gray-900">
                {completedMilestones} / {milestones.length}
              </span>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${milestonePercentage}%` }}
                />
              </div>
            </div>
            {nextMilestone && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Next: {nextMilestone.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-6 flex items-center space-x-4">
          {checklistPercentage === 100 && milestonePercentage === 100 ? (
            <div className="flex items-center text-green-700 bg-green-50 rounded-full px-3 py-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">All Complete</span>
            </div>
          ) : (checklistPercentage >= 50 && milestonePercentage >= 50) ? (
            <div className="flex items-center text-blue-700 bg-blue-50 rounded-full px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">On Track</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-700 bg-yellow-50 rounded-full px-3 py-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Needs Attention</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}