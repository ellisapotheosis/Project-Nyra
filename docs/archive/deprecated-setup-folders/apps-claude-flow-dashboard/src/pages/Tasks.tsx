'use client';

import React from 'react';
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard';

const TasksPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-white">Tasks</h1>
      <TaskKanbanBoard />
    </div>
  );
};

export default TasksPage;
