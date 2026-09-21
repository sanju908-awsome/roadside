import React from 'react';
import { AssistanceRequest } from '../../types';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Wrench,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface IncomingRequestCardProps {
  request: AssistanceRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingRequestCard: React.FC<IncomingRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  return (
    <div
      id={`incoming-req-${request.id}`}
      className="bg-white rounded-2xl border-2 border-[#00C2FF] shadow-xl overflow-hidden animate-bounceSubtle ring-4 ring-[#00C2FF]/20"
    >
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-[#0B1F4B] to-[#163D7A] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#00C2FF] animate-ping" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF] block">
              Incoming Live SOS Dispatch
            </span>
            <h3 className="text-base font-bold font-heading">
              New Vehicle Assistance Request
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono bg-[#00C2FF]/20 text-[#00C2FF] px-2.5 py-1 rounded-lg font-bold border border-[#00C2FF]/40">
          Job #{request.id}
        </span>
      </div>

      {/* Body Details */}
      <div className="p-5 space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {/* Customer */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Customer
            </span>
            <span className="font-bold text-slate-900 text-sm">{request.customerName}</span>
            <span className="block text-[11px] text-slate-500 font-mono">
              {request.customerPhone}
            </span>
          </div>

          {/* Vehicle */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Vehicle Breakdown
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {request.vehicle.brand} {request.vehicle.model}
            </span>
            <span className="block text-[11px] text-slate-500 font-mono">
              {request.vehicle.registrationNumber} ({request.vehicle.fuelType})
            </span>
          </div>
        </div>

        {/* Problem Breakdown Card */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              Reported Issue: {request.problem}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
              Priority High
            </span>
          </div>
          {request.problemDescription && (
            <p className="text-[11px] text-amber-800 italic">
              "{request.problemDescription}"
            </p>
          )}
        </div>

        {/* Distance, Location & Price */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>{request.distanceKm.toFixed(1)} km away</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>~{request.etaMinutes} min trip</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Est. Revenue</span>
            <span className="text-sm font-bold text-emerald-700 font-mono">
              {formatINR(request.estimatedPrice.min)} – {formatINR(request.estimatedPrice.max)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            id="decline-request-btn"
            onClick={onDecline}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>DECLINE</span>
          </button>

          <button
            type="button"
            id="accept-request-btn"
            onClick={onAccept}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00C2FF]" />
            <span>ACCEPT REQUEST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
