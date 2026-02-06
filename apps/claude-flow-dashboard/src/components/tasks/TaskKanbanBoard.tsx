import React from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const statusColors = {
  'pending': 'bg-yellow-100 border-yellow-300',
  'in-progress': 'bg-blue-100 border-blue-300',
  'completed': 'bg-green-100 border-green-300',
  'failed': 'bg-red-100 border-red-300'
};

export const TaskKanbanBoard: React.FC = () => {
  const { tasks } = useTaskStore();

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const columns = ['pending', 'in-progress', 'completed', 'failed'];

  if (tasks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        <div className="text-center text-gray-500">
          <LoadingSpinner />
          <p>No tasks available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Task Kanban</h2>
      <div className="grid grid-cols-4 gap-4">
        {columns.map((status) => (
          <div key={status} className="bg-gray-50 rounded-lg p-2">
            <h3 className="text-sm font-medium uppercase mb-2">{status}</h3>
            <div>
              {groupedTasks[status]?.map((task) => (
                <div
                  key={task.id}
                  className={`
                    p-2 mb-2 rounded border
                    ${statusColors[status as keyof typeof statusColors]}
                  `}
                >
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {task.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};