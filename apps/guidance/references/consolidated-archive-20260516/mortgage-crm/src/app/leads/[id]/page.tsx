import {
  CheckCircle2,
  Clock,
  FileText,
  User,
  Home,
  Paperclip,
  MessageSquare,
  History,
  Send
} from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl border-4 border-white shadow-sm">
            JD
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">John Doe</h1>
            <div className="flex items-center space-x-3 mt-1 text-slate-500 font-medium">
              <span className="flex items-center"><Clock size={16} className="mr-1" /> Last contact 2h ago</span>
              <span>•</span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Lead {id}</span>
              <span>•</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">Qualified</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="px-6 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">Log Contact</button>
          <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all">Start Application</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Details */}
        <div className="col-span-8 space-y-8">
          {/* Information Cards */}
          <div className="grid grid-cols-2 gap-6">
            <DetailCard 
              icon={<User size={20} className="text-blue-500" />} 
              title="Borrower Info" 
              details={[
                { label: "Email", value: "john.doe@example.com" },
                { label: "Phone", value: "(555) 012-3456" },
                { label: "Employment", value: "Software Engineer (5 yrs)" },
                { label: "Annual Income", value: "$120,000" }
              ]} 
            />
            <DetailCard 
              icon={<Home size={20} className="text-purple-500" />} 
              title="Loan Request" 
              details={[
                { label: "Amount", value: "$450,000" },
                { label: "Property Type", value: "Single Family" },
                { label: "Zip Code", value: "90210" },
                { label: "Source", value: "RateHunter Website" }
              ]} 
            />
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-8 flex items-center">
              <History size={20} className="mr-2 text-slate-400" /> Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
              <TimelineItem 
                title="Lead Qualified" 
                time="Today, 10:45 AM" 
                desc="Lead score calculated at 45 based on income and loan amount."
                icon={<CheckCircle2 className="text-green-500" size={16} />} 
              />
              <TimelineItem 
                title="Phone Conversation" 
                time="Yesterday, 2:30 PM" 
                desc="Discussed conventional 30yr fixed options. Borrower is interested in moving forward."
                icon={<MessageSquare className="text-blue-500" size={16} />} 
              />
              <TimelineItem 
                title="Lead Created" 
                time="2 days ago" 
                desc="Inbound from ratehunter.net landing page."
                icon={<FileText className="text-slate-400" size={16} />} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Actions/Docs */}
        <div className="col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-6 flex items-center">
              <Paperclip size={20} className="mr-2 text-slate-400" /> Documents
            </h3>
            <div className="space-y-4">
              <DocumentRow name="Paystubs (30 days)" status="REQUIRED" />
              <DocumentRow name="W2 - 2025" status="REQUIRED" />
              <DocumentRow name="Bank Statements" status="VERIFIED" />
              <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all">
                + Request More
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h3 className="text-xl font-black tracking-tighter mb-4">Quick Note</h3>
            <textarea 
              className="w-full bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 mb-4" 
              placeholder="Type your notes here..."
            />
            <button className="w-full bg-blue-600 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all">
              <Send size={18} />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, title, details }: { icon: React.ReactNode, title: string, details: any[] }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <h3 className="text-lg font-black text-slate-900 tracking-tighter">{title}</h3>
      </div>
      <div className="space-y-4">
        {details.map((d, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">{d.label}</span>
            <span className="text-slate-700 font-bold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ title, time, desc, icon }: { title: string, time: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="relative pl-10 group">
      <div className="absolute left-0 w-10 flex justify-center mt-1">
        <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10 group-hover:border-blue-400 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-black text-slate-900 tracking-tight">{title}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function DocumentRow({ name, status }: { name: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
      <div className="flex items-center space-x-3">
        <FileText size={16} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-700">{name}</span>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
        status === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
      }`}>
        {status}
      </span>
    </div>
  );
}
