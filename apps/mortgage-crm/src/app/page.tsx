import { KanbanBoard } from "../components/ui/kanban-board";

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pipeline Overview</h2>
          <p className="text-gray-600 text-sm mt-1">
            Drag and drop leads to update their status.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 font-medium">
            Filter
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-medium">
            + New Lead
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
