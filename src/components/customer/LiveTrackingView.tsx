import React, { useState } from 'react';
import { AssistanceRequest, Coordinates } from '../../types';
import { InteractiveMapView } from '../map/InteractiveMapView';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface LiveTrackingViewProps {
  request: AssistanceRequest;
  mechanicLiveCoords: Coordinates | null;
  onBack: () => void;
  onCancel: () => void;
  onOpenChat: () => void;
  onCall: () => void;
  // Demo step triggers for the presentation
  onSimulateMove?: () => void;
  onAdvanceToArrived?: () => void;
  onAdvanceToStartService?: () => void;
  onAdvanceToCompleteService?: () => void;
}

const TRACKING_STEPS = [
  { key: 'PENDING', label: 'Requested', desc: 'Awaiting dispatch' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Assigned to tech' },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'Live GPS navigation' },
  { key: 'ARRIVED', label: 'Arrived', desc: 'At customer vehicle' },
  { key: 'IN_PROGRESS', label: 'Service', desc: 'Repairs underway' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Invoice generated' },
];

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  request,
  mechanicLiveCoords,
  onBack,
  onCancel,
  onOpenChat,
  onCall,
  onSimulateMove,
  onAdvanceToArrived,
  onAdvanceToStartService,
  onAdvanceToCompleteService,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Determine current step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'ON_THE_WAY':
        return 2;
      case 'ARRIVED':
        return 3;
      case 'IN_PROGRESS':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(request.status);

  // Status headline
  const getStatusHeadline = () => {
    switch (request.status) {
      case 'PENDING':
        return 'Connecting to ' + request.mechanicShopName + '...';
      case 'ACCEPTED':
        return request.mechanicShopName + ' has accepted your request';
      case 'ON_THE_WAY':
        return request.mechanicShopName + ' is on the way';
      case 'ARRIVED':
        return request.mechanicOwnerName + ' has arrived at your location';
      case 'IN_PROGRESS':
        return 'Repair service in progress on ' + request.vehicle.brand + ' ' + request.vehicle.model;
      case 'COMPLETED':
        return 'Service completed by ' + request.mechanicShopName;
      default:
        return 'Roadside Assistance Tracking';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F7FA]">
      {/* Top Bar */}
      <div className="bg-[#0B1F4B] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
              <h2 className="text-sm sm:text-base font-bold font-heading text-white">
                {getStatusHeadline()}
              </h2>
            </div>
            <span className="text-[11px] text-slate-300 block font-mono">
              Job #{request.id} • {request.vehicle.brand} {request.vehicle.model} ({request.problem})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-semibold text-rose-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-rose-900/40 border border-rose-500/30 transition-colors"
            >
              CANCEL
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#00C2FF] -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%`,
              }}
            />

            {/* Stepper nodes */}
            {TRACKING_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                      isPast
                        ? 'bg-[#19C37D] text-white'
                        : isCurrent
                        ? 'bg-[#00C2FF] text-[#0B1F4B] ring-4 ring-[#00C2FF]/30 scale-110'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold mt-1.5 whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#0B1F4B]'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Large Interactive Map + Floating Details Card */}
      <div className="relative flex-1 overflow-hidden min-h-[420px]">
        {/* Full-bleed Map */}
        <InteractiveMapView
          customerCoords={request.customerLocation.coords}
          mechanicLiveLocation={mechanicLiveCoords || request.mechanicLocation}
          selectedMechanicId={request.mechanicId}
          activeRoute={true}
          trackingStatus={request.status}
          height="100%"
          showSearchAreaBadge={false}
        />

        {/* Demo Fast-Forward Simulation Bar */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-30">
          <div className="bg-[#0B1F4B]/95 backdrop-blur-md p-3 rounded-2xl border border-[#00C2FF]/40 text-white shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#00C2FF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                SIMULATOR CONTROLS
              </span>
              <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                Phase: {request.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              {request.status === 'ON_THE_WAY' && onAdvanceToArrived && (
                <button
                  type="button"
                  onClick={onAdvanceToArrived}
                  className="py-1.5 px-2 rounded-lg bg-[#00C2FF] text-[#0B1F4B] hover:bg-cyan-300 transition-colors text-center"
                >
                  ⚡ Fast Arrive
                </button>
              )}

              {request.status === 'ARRIVED' && onAdvanceToStartService && (
                <button
                  type="button"
                  onClick={onAdvanceToStartService}
                  className="py-1.5 px-2 rounded-lg bg-[#19C37D] text-white hover:bg-emerald-600 transition-colors text-center col-span-3"
                >
                  ▶ Start Service
                </button>
              )}

              {request.status === 'IN_PROGRESS' && onAdvanceToCompleteService && (
                <button
                  type="button"
                  onClick={onAdvanceToCompleteService}
                  className="py-1.5 px-2 rounded-lg bg-[#5B8CFF] text-white hover:bg-blue-600 transition-colors text-center col-span-3"
                >
                  ✓ Complete Service
                </button>
              )}

              {request.status === 'ACCEPTED' && (
                <div className="col-span-3 text-[11px] text-slate-300 text-center py-1">
                  Mechanic accepted! Starting vehicle dispatch...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Floating Card: Mechanic Info, ETA, Quick Actions */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-30">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            {/* Dynamic Status Header */}
            <div className="bg-[#0B1F4B] p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C2FF] block">
                  Live Dispatch ETA
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold font-heading text-white">
                    {request.status === 'ARRIVED'
                      ? 'ARRIVED'
                      : request.status === 'IN_PROGRESS'
                      ? 'SERVICING'
                      : `${request.etaMinutes} min`}
                  </span>
                  {request.status === 'ON_THE_WAY' && (
                    <span className="text-xs text-slate-300 font-mono">
                      ({request.distanceKm.toFixed(1)} km away)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Estimated cost</span>
                <span className="text-sm font-bold text-white">
                  {formatINR(request.estimatedPrice.min)} – {formatINR(request.estimatedPrice.max)}
                </span>
              </div>
            </div>

            {/* Mechanic Profile Info Row */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-[#00C2FF] overflow-hidden flex items-center justify-center font-bold text-[#0B1F4B] text-lg">
                    {request.mechanicOwnerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{request.mechanicShopName}</span>
                      <ShieldCheck className="w-4 h-4 text-[#19C37D]" />
                    </h4>
                    <p className="text-xs text-slate-500">
                      Mechanic: <span className="font-semibold text-slate-700">{request.mechanicOwnerName}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.8</span>
                      <span className="text-slate-400 font-normal">(142 jobs)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    DISPATCHED
                  </span>
                </div>
              </div>

              {/* Location & Vehicle quick recap */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00C2FF] flex-shrink-0" />
                  <span className="truncate font-medium">{request.customerLocation.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-bold text-slate-800">{request.problem}</span>
                  <span className="text-slate-400">•</span>
                  <span>{request.vehicle.brand} {request.vehicle.model}</span>
                </div>
              </div>

              {/* Call & Message CTAs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  id="call-mechanic-cta-btn"
                  onClick={onCall}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-[#19C37D]" />
                  <span>CALL</span>
                </button>

                <button
                  type="button"
                  id="chat-mechanic-cta-btn"
                  onClick={onOpenChat}
                  className="py-2.5 px-3 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-[#00C2FF]" />
                  <span>MESSAGE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Request Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-heading">
              Cancel Assistance Request?
            </h4>
            <p className="text-xs text-slate-500">
              The workshop technician is currently en route with equipment. Are you sure you want to cancel?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                KEEP REQUEST
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  onCancel();
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                YES, CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
