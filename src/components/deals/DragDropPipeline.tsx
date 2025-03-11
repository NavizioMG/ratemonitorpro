import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical, GripVertical } from 'lucide-react';
import { debug, Category } from '../../lib/debug';

interface Props {
  stages: any[];
  deals: any[];
  onDragEnd: (result: any) => void;
  onDealClick: (deal: any) => void;
  selectedDealId?: string;
}

export function DragDropPipeline({ 
  stages, 
  deals, 
  onDragEnd, 
  onDealClick,
  selectedDealId 
}: Props) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    try {
      debug.logInfo(Category.UI, 'Deal dragged', {
        dealId: result.draggableId,
        source: result.source,
        destination: result.destination
      });

      onDragEnd(result);
    } catch (err) {
      debug.logError(Category.UI, 'Error handling drag end', {}, err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stages.map(stage => (
          <div key={stage.id} className={`${stage.color} p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">{stage.name}</h3>
              <span className="text-sm text-gray-500">
                {deals.filter(d => d.stage === stage.id).length} deals
              </span>
            </div>

            <Droppable droppableId={stage.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[100px]"
                >
                  {deals
                    .filter(deal => deal.stage === stage.id)
                    .map((deal, index) => (
                      <Draggable 
                        key={deal.id} 
                        draggableId={deal.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              bg-white p-4 rounded-lg shadow-sm border border-gray-200 
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                              ${selectedDealId === deal.id ? 'ring-2 ring-primary' : ''}
                              hover:shadow-md transition-shadow
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                </div>
                                <div 
                                  className="flex-1 cursor-pointer"
                                  onClick={() => onDealClick(deal)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-primary font-medium">
                                        {deal.client.first_name[0]}{deal.client.last_name[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-900">
                                        {deal.client.first_name} {deal.client.last_name}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        ${deal.amount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-500">
                                  <MoreVertical className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <div className="flex items-center text-gray-500">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  deal.probability >= 75 ? 'bg-green-100 text-green-800' :
                                  deal.probability >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {deal.probability}%
                                </span>
                              </div>
                              <div className="flex items-center text-gray-500">
                                {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}