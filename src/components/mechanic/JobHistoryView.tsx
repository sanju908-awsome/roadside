import React from 'react';
import { AssistanceRequest, MechanicStats } from '../../types';
import {
  Calendar,
  Car,
  CheckCircle2,
  DollarSign,
  FileText,
  IndianRupee,
  Star,
  TrendingUp,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface JobHistoryViewProps {
  stats: MechanicStats;
  history: AssistanceRequest[];
}

export const JobHistoryView: React.FC<JobHistoryViewProps> = ({ stats, history }) => {
  // Prepend some realistic past demo jobs if history is small
  const demoPastJobs = [
    {
      id: 'req_past_1',
      customerName: 'K. Satya',
      vehicle: { brand: 'Tata', model: 'Harrier' },
      problem: 'FLAT TYRE',
      date: 'Yesterday, 4:15 PM',
      status: 'COMPLETED',
      amount: 350,
      rating: 5,
    },
    {
      id: 'req_past_2',
      customerName: 'Anil Chowdary',
      vehicle: { brand: 'Maruti', model: 'Brezza' },
      problem: 'BATTERY',
      date: 'Sep 19, 11:30 AM',
      status: 'COMPLETED',
      amount: 450,
      rating: 5,
    },
    {
      id: 'req_past_3',
      customerName: 'Pooja Nair',
      vehicle: { brand: 'Honda', model: 'City' },
      problem: 'OVERHEATING',
      date: 'Sep 18, 6:45 PM',
      status: 'COMPLETED',
      amount: 600,
      rating: 4,
    },
    {
      id: 'req_past_4',
      customerName: 'Venkatesh Rao',
      vehicle: { brand: 'Hyundai', model: 'Venue' },
      problem: 'FUEL',
      date: 'Sep 17, 2:10 PM',
      status: 'CANCELLED',
      amount: 0,
      rating: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Earnings and Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-heading text-[#0B1F4B]">
              {formatINR(stats.totalEarnings)}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% this week
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Completed Dispatches
          </span>
          <span className="text-2xl font-bold font-heading text-slate-900 mt-1 block">
            {stats.completedJobs}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">98.2% completion rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Today's Inflow
          </span>
          <span className="text-2xl font-bold font-heading text-[#00C2FF] mt-1 block">
            {stats.todayJobs}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Assistance calls today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Average Rating
          </span>
          <div className="flex items-center gap-1 text-2xl font-bold font-heading text-amber-500 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>4.85</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">From 142 reviews</span>
        </div>
      </div>

      {/* History Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dispatched Jobs Ledger</h3>
            <p className="text-[11px] text-slate-500">
              Audit trail of all emergency calls accepted by your workshop.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Render active session jobs first if any */}
          {history.map((job) => (
            <div key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{job.customerName}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    Job #{job.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.vehicle.brand} {job.vehicle.model}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#0B1F4B]">{job.problem}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-bold font-mono text-[#0B1F4B]">
                  {formatINR(job.finalPrice || job.estimatedPrice.min)}
                </span>
                {job.rating && (
                  <div className="flex items-center sm:justify-end gap-1 text-amber-500 font-bold text-[11px]">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{job.rating} Stars</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Preset past jobs */}
          {demoPastJobs.map((pJob) => (
            <div key={pJob.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{pJob.customerName}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    Job #{pJob.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pJob.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pJob.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">• {pJob.date}</span>
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pJob.vehicle.brand} {pJob.vehicle.model}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#0B1F4B]">{pJob.problem}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-bold font-mono text-[#0B1F4B]">
                  {pJob.amount > 0 ? formatINR(pJob.amount) : '₹0 (Cancelled)'}
                </span>
                {pJob.rating && (
                  <div className="flex items-center sm:justify-end gap-1 text-amber-500 font-bold text-[11px]">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{pJob.rating} Stars</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
