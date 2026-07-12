import { KanbanBoard } from "../components/ui/kanban-board";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  Activity,
  Target,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            Loan Pipeline
          </h2>
          <p className="text-slate-500 font-medium">
            Tracking 12 active leads and 4 applications.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-slate-900 text-white rounded-lg transition-all">
            All Time
          </button>
          <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 rounded-lg transition-all">
            This Month
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Pipeline"
          value="$4.2M"
          change="+12.5%"
          positive={true}
          icon={<Activity size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Lead Conversion"
          value="24%"
          change="-2.1%"
          positive={false}
          icon={<Target size={20} className="text-purple-600" />}
        />
        <StatCard
          title="New Leads"
          value="18"
          change="+4"
          positive={true}
          icon={<Users size={20} className="text-pink-600" />}
        />
        <StatCard
          title="Avg. Cycle Time"
          value="14 Days"
          change="-2 Days"
          positive={true}
          icon={<FileText size={20} className="text-orange-600" />}
        />
      </div>

      {/* Kanban Container */}
      <div className="flex-1 min-h-0 bg-white/50 border border-slate-200 rounded-[2.5rem] p-8 shadow-sm overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <Badge active>All Leads</Badge>
            <Badge>Conventional</Badge>
            <Badge>Government</Badge>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Sort by:</span>
            <select className="bg-transparent border-none focus:ring-0 cursor-pointer text-slate-900">
              <option>Newest First</option>
              <option>Loan Amount</option>
              <option>Urgency</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black uppercase ${
            positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
        {value}
      </h3>
    </div>
  );
}

function Badge({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
