import React from 'react';
import { MechanicShop } from '../../types';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface MechanicProfileModalProps {
  mechanic: MechanicShop | null;
  distanceKm: number;
  isOpen: boolean;
  onClose: () => void;
  onRequest: () => void;
  onCall: () => void;
  onMessage: () => void;
}

export const MechanicProfileModal: React.FC<MechanicProfileModalProps> = ({
  mechanic,
  distanceKm,
  isOpen,
  onClose,
  onRequest,
  onCall,
  onMessage,
}) => {
  if (!isOpen || !mechanic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        id="mechanic-profile-dialog"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-scaleUp"
      >
        {/* Header Photo & Close */}
        <div className="relative h-48 w-full bg-slate-900 flex-shrink-0">
          <img
            src={mechanic.imageUrl}
            alt={mechanic.shopName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Verification & Availability Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {mechanic.isVerified && (
              <span className="inline-flex items-center gap-1 bg-[#19C37D] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED WORKSHOP
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                mechanic.isAvailable ? 'bg-[#00C2FF] text-[#0B1F4B]' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mechanic.isAvailable ? 'bg-[#0B1F4B] animate-pulse' : 'bg-slate-400'
                }`}
              />
              {mechanic.isAvailable ? 'AVAILABLE NOW' : 'OFFLINE'}
            </span>
          </div>

          {/* Title Info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold font-heading">{mechanic.shopName}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs mt-1 text-slate-200">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {mechanic.rating} ({mechanic.reviewsCount} reviews)
              </span>
              <span>•</span>
              <span>By {mechanic.ownerName}</span>
              <span>•</span>
              <span>{mechanic.yearsOfExperience} years experience</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#00C2FF]">
                <MapPin className="w-3.5 h-3.5" />
                {distanceKm} km away
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* About */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              About the Workshop
            </h4>
            <p className="text-sm leading-relaxed text-slate-600">{mechanic.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{mechanic.address}, {mechanic.city}</span>
            </div>
          </div>

          {/* Supported Vehicles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Supported Vehicle Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {mechanic.supportedVehicles.map((vType) => (
                <span
                  key={vType}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  ✓ {vType}
                </span>
              ))}
            </div>
          </div>

          {/* Services & Fixed Rates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Services & Standard Rates
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {mechanic.services.map((srv) => (
                <div key={srv.id} className="p-3.5 flex items-center justify-between hover:bg-white transition-colors">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{srv.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" /> ~{srv.estimatedMinutes} mins avg duration
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-base font-bold text-[#0B1F4B]">{formatINR(srv.price)}</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Standard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Skills & Diagnostic Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Specialist Skills & Equipment
            </h4>
            <div className="flex flex-wrap gap-2">
              {mechanic.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B1F4B]/5 text-[#0B1F4B] border border-[#0B1F4B]/10 text-xs font-medium"
                >
                  <Wrench className="w-3 h-3 text-[#00C2FF]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Reviews preview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Verified Motorist Reviews
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Arun Varma • Hyundai Verna</span>
                  <span className="text-amber-400">★★★★★</span>
                </div>
                <p className="text-slate-600">
                  "Battery died on the highway at 9 PM. Ravi reached in 8 minutes with heavy booster cables and got me going instantly. Highly recommended!"
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Kavitha Reddy • Kia Seltos</span>
                  <span className="text-amber-400">★★★★★</span>
                </div>
                <p className="text-slate-600">
                  "Very honest pricing and fast response. Replaced my punctured tyre cleanly with torque wrench."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCall}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#19C37D]" />
              <span>CALL</span>
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00C2FF]" />
              <span>MESSAGE</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRequest();
            }}
            disabled={!mechanic.isAvailable}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              mechanic.isAvailable
                ? 'bg-[#0B1F4B] hover:bg-[#163D7A] text-white active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>REQUEST MECHANIC</span>
            <span className="text-[11px] text-[#00C2FF]">
              ({formatINR(mechanic.pricingRange.min)}+)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
