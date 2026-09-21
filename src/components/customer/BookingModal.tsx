import React, { useState } from 'react';
import { LocationInfo, MechanicShop, ProblemType, Vehicle } from '../../types';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanic: MechanicShop | null;
  customerName: string;
  vehicle: Vehicle | null;
  problem: ProblemType | null;
  problemDescription: string;
  location: LocationInfo;
  distanceKm: number;
  etaMinutes: number;
  onConfirm: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  mechanic,
  customerName,
  vehicle,
  problem,
  problemDescription,
  location,
  distanceKm,
  etaMinutes,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mechanic || !vehicle) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm();
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        id="booking-confirmation-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp"
      >
        {/* Header */}
        <div className="bg-[#0B1F4B] p-5 text-white flex items-center justify-between border-b border-slate-700">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#00C2FF] uppercase block">
              Confirm Roadside Assistance Request
            </span>
            <h3 className="text-xl font-bold font-heading">Dispatch Overview</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table / Card */}
        <div className="p-6 space-y-4 text-xs">
          {/* Key Dispatch Specs Table */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl divide-y divide-slate-200/80 overflow-hidden">
            {/* Customer */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Customer
              </span>
              <span className="font-semibold text-slate-900 text-sm">{customerName}</span>
            </div>

            {/* Vehicle */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Vehicle
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900 text-sm">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </span>
                <span className="block text-[10px] text-slate-500 font-mono">
                  {vehicle.registrationNumber} • {vehicle.fuelType}
                </span>
              </div>
            </div>

            {/* Problem */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                Problem
              </span>
              <div className="text-right">
                <span className="font-bold text-[#0B1F4B] bg-[#00C2FF]/20 px-2 py-0.5 rounded-md text-xs">
                  {problem || 'GENERAL DIAGNOSIS'}
                </span>
                {problemDescription && (
                  <span className="block text-[10px] text-slate-500 mt-1 max-w-[240px] truncate">
                    {problemDescription}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location
              </span>
              <div className="text-right max-w-[260px]">
                <span className="font-semibold text-slate-900 line-clamp-1">
                  {location.address}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono">
                  GPS: {location.coords.lat.toFixed(4)}, {location.coords.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Mechanic */}
            <div className="p-3.5 flex items-center justify-between bg-white">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#19C37D]" />
                Mechanic
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900 text-sm">
                  {mechanic.shopName}
                </span>
                <span className="block text-[10px] text-slate-500">
                  Lead Tech: {mechanic.ownerName} (★ {mechanic.rating})
                </span>
              </div>
            </div>

            {/* Distance & ETA */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00C2FF]" />
                Distance & ETA
              </span>
              <div className="text-right">
                <span className="font-bold text-[#0B1F4B] text-sm">
                  {distanceKm} km • ~{etaMinutes} min
                </span>
              </div>
            </div>

            {/* Estimated Price */}
            <div className="p-3.5 flex items-center justify-between bg-emerald-50/50">
              <div>
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] block">
                  Estimated Price
                </span>
                <span className="text-[10px] text-emerald-600">
                  Final invoice finalized post onsite inspection
                </span>
              </div>
              <span className="font-bold text-base text-emerald-800 font-mono">
                {formatINR(mechanic.pricingRange.min)} – {formatINR(mechanic.pricingRange.max)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              Once confirmed, your request will be locked and sent instantly to {mechanic.shopName}.
              You can track their live GPS location as soon as they dispatch.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            CANCEL
          </button>

          <button
            type="button"
            id="confirm-booking-request-btn"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>DISPATCHING...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#00C2FF]" />
                <span>CONFIRM REQUEST</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
