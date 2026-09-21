import React from 'react';
import { AssistanceRequest } from '../../types';
import { CheckCircle2, Clock, FileText, IndianRupee, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface ServiceSummaryModalProps {
  isOpen: boolean;
  request: AssistanceRequest | null;
  onProceedToRating: () => void;
}

export const ServiceSummaryModal: React.FC<ServiceSummaryModalProps> = ({
  isOpen,
  request,
  onProceedToRating,
}) => {
  if (!isOpen || !request) return null;

  const finalAmount = request.finalPrice || 450;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        id="service-completed-summary-modal"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp"
      >
        {/* Top Celebration Banner */}
        <div className="bg-[#0B1F4B] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-[#00C2FF]/10 blur-xl" />
          <div className="w-14 h-14 rounded-full bg-[#19C37D]/20 text-[#19C37D] mx-auto flex items-center justify-center border-2 border-[#19C37D] mb-3 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00C2FF] block">
            Roadside Assistance Completed
          </span>
          <h3 className="text-2xl font-bold font-heading mt-1">Vehicle Ready to Roll</h3>
          <p className="text-xs text-slate-300 mt-1">
            Service technician has successfully resolved the issue.
          </p>
        </div>

        {/* Invoice & Service Details */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary receipt card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500 font-semibold">Workshop</span>
              <span className="font-bold text-slate-900 text-sm">{request.mechanicShopName}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-semibold">Technician</span>
              <span className="font-semibold text-slate-800">{request.mechanicOwnerName}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-semibold">Service Performed</span>
              <span className="font-bold text-[#0B1F4B]">{request.problem} Onsite Triage</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00C2FF]" />
                Time Spent
              </span>
              <span className="font-semibold text-slate-800">25 minutes</span>
            </div>

            <div className="pt-2 flex items-center justify-between bg-emerald-50 -mx-4 -mb-4 p-4 rounded-b-xl border-t border-emerald-200/60">
              <div>
                <span className="text-emerald-900 font-bold block text-sm">Final Amount</span>
                <span className="text-[10px] text-emerald-700">Digital Tax Invoice Included</span>
              </div>
              <span className="text-xl font-bold text-emerald-800 font-mono">
                {formatINR(finalAmount)}
              </span>
            </div>
          </div>

          {/* Technician Notes */}
          {request.serviceNotes && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-600">
              <span className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#00C2FF]" />
                Technician Notes:
              </span>
              <p className="text-[11px] italic">"{request.serviceNotes}"</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            id="proceed-to-rate-service-btn"
            onClick={onProceedToRating}
            className="w-full py-3 px-4 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#00C2FF]" />
            <span>PROCEED TO RATE SERVICE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
