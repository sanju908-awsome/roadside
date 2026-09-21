import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  Radar,
  Radio,
  ShieldAlert,
  Wrench,
  X,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSOS: (mechanicId: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onConfirmSOS,
}) => {
  const { customerLocation, selectedVehicle, mechanics } = useApp();
  const [scanStep, setScanStep] = useState<'scanning' | 'found'>('scanning');

  useEffect(() => {
    if (isOpen) {
      setScanStep('scanning');
      const timer = setTimeout(() => {
        setScanStep('found');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableMechanics = mechanics.filter((m) => m.isAvailable && m.emergencyAvailable);
  const nearestMech = availableMechanics[0] || mechanics[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        id="emergency-sos-modal"
        className="bg-[#07111F] text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-500/60 animate-scaleUp relative"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Radar Scanner Animation View */}
        {scanStep === 'scanning' ? (
          <div className="p-8 text-center space-y-6">
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              {/* Concentric radar rings */}
              <div className="absolute inset-0 rounded-full border border-[#00C2FF]/30 animate-ping" />
              <div className="absolute inset-4 rounded-full border border-[#00C2FF]/40" />
              <div className="absolute inset-10 rounded-full border border-rose-500/40" />
              {/* Radar Rotating Line */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-[#00C2FF]/30 origin-right animate-radar" />
              </div>
              <div className="relative w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/50">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase block">
                Emergency Rapid Response Protocol
              </span>
              <h2 className="text-2xl font-bold font-heading text-white mt-1">
                WE'RE FINDING HELP.
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Broadcasting emergency coordinates to certified 24/7 mobile technicians within 5 km...
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Location: {customerLocation.address}</span>
            </div>
          </div>
        ) : (
          /* Found Nearest Emergency Help View */
          <div className="p-6 space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {availableMechanics.length} EMERGENCY MECHANICS ONLINE NEARBY
              </span>
              <h3 className="text-xl font-bold font-heading text-white mt-2">
                Priority Dispatch Ready
              </h3>
              <p className="text-xs text-slate-300">
                Nearest mobile unit can reach your vehicle in ~{nearestMech ? '6-8' : '10'} minutes.
              </p>
            </div>

            {/* Nearest Unit Card */}
            {nearestMech && (
              <div className="bg-[#0B1F4B] border border-[#00C2FF]/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                      <span>{nearestMech.shopName}</span>
                      <ShieldAlert className="w-4 h-4 text-[#00C2FF]" />
                    </h4>
                    <span className="text-xs text-slate-300">
                      Lead Tech: {nearestMech.ownerName} (★ {nearestMech.rating})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#00C2FF]/20 text-[#00C2FF] px-2 py-1 rounded-lg border border-[#00C2FF]/30">
                    1.8 km away
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-700/80 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00C2FF]" />
                    <span>Arrival ETA: ~7 mins</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">
                      {formatINR(nearestMech.pricingRange.min)} – {formatINR(nearestMech.pricingRange.max)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown vehicle confirmation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Vehicle Requiring Assistance
                </span>
                <span className="font-bold text-white">
                  {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.registrationNumber})
                </span>
              </div>
              <Wrench className="w-4 h-4 text-[#00C2FF]" />
            </div>

            {/* Action CTA */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="instant-sos-dispatch-btn"
                onClick={() => {
                  onConfirmSOS(nearestMech.id);
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>DISPATCH EMERGENCY ROADSIDE HELP NOW</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel and return to standard search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
