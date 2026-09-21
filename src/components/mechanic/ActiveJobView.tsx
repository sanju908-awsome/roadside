import React, { useState } from 'react';
import { AssistanceRequest, Coordinates } from '../../types';
import { InteractiveMapView } from '../map/InteractiveMapView';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  FileCheck,
  IndianRupee,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Play,
  Send,
  Wrench,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface ActiveJobViewProps {
  request: AssistanceRequest;
  mechanicLiveCoords: Coordinates | null;
  onStartTrip: () => void;
  onMarkArrived: () => void;
  onStartService: () => void;
  onCompleteService: (finalPrice: number, notes: string) => void;
  onOpenChat: () => void;
  onCall: () => void;
}

export const ActiveJobView: React.FC<ActiveJobViewProps> = ({
  request,
  mechanicLiveCoords,
  onStartTrip,
  onMarkArrived,
  onStartService,
  onCompleteService,
  onOpenChat,
  onCall,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState<number>(450);
  const [serviceNotes, setServiceNotes] = useState(
    'Replaced battery terminals, cleaned corrosion, and conducted jump start test. Vehicle running smoothly.'
  );

  const handleFinishJob = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteService(finalPrice, serviceNotes);
    setShowCompletionModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#0B1F4B] text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#00C2FF]">
              Active Roadside Mission
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white mt-1">
            Job #{request.id} • {request.customerName}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Breakdown: <span className="font-bold text-white">{request.problem}</span> on{' '}
            {request.vehicle.brand} {request.vehicle.model} ({request.vehicle.registrationNumber})
          </p>
        </div>

        {/* Current Job Status Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#00C2FF] text-[#0B1F4B] text-xs font-bold uppercase tracking-wider shadow-sm">
            Status: {request.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Controls & Customer Details, Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Workflow Controls & Customer Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Step Action Box based on Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#00C2FF]" />
              Technician Workflow Actions
            </h3>

            {request.status === 'ACCEPTED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  You have accepted this job. Load your diagnostic kit and click below to begin GPS trip navigation.
                </p>
                <button
                  type="button"
                  id="mechanic-start-trip-btn"
                  onClick={onStartTrip}
                  className="w-full py-3 px-4 bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-[#00C2FF]" />
                  <span>START TRIP & SHARE LIVE LOCATION</span>
                </button>
              </div>
            )}

            {request.status === 'ON_THE_WAY' && (
              <div className="space-y-3">
                <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-xl text-xs text-cyan-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-ping" />
                    <span>Broadcasting live GPS to customer...</span>
                  </div>
                  <span className="font-bold font-mono">
                    ~{request.etaMinutes} min ({request.distanceKm.toFixed(1)} km)
                  </span>
                </div>

                <button
                  type="button"
                  id="mechanic-mark-arrived-btn"
                  onClick={onMarkArrived}
                  className="w-full py-3 px-4 bg-[#19C37D] hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>I HAVE ARRIVED AT CUSTOMER'S VEHICLE</span>
                </button>
              </div>
            )}

            {request.status === 'ARRIVED' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  You are at the customer's vehicle location. Meet the owner, verify safety, and start service diagnostics.
                </p>
                <button
                  type="button"
                  id="mechanic-start-service-btn"
                  onClick={onStartService}
                  className="w-full py-3 px-4 bg-[#0B1F4B] hover:bg-[#163D7A] active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 text-[#00C2FF]" />
                  <span>START SERVICE / REPAIRS</span>
                </button>
              </div>
            )}

            {request.status === 'IN_PROGRESS' && (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Repair work in progress. Enter final billing once completed.</span>
                </div>

                <button
                  type="button"
                  id="mechanic-complete-service-btn"
                  onClick={() => setShowCompletionModal(true)}
                  className="w-full py-3 px-4 bg-[#19C37D] hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>COMPLETE SERVICE & GENERATE INVOICE</span>
                </button>
              </div>
            )}
          </div>

          {/* Customer & Breakdown Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Customer & Breakdown Dossier
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900 text-sm">{request.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-mono font-semibold text-slate-800">{request.customerPhone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Vehicle:</span>
                <span className="font-semibold text-slate-800">
                  {request.vehicle.brand} {request.vehicle.model} ({request.vehicle.year})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Plate Number:</span>
                <span className="font-mono font-bold text-blue-900 bg-amber-100 px-2 py-0.5 rounded">
                  {request.vehicle.registrationNumber}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Breakdown Location:</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                  {request.customerLocation.address}
                </span>
              </div>

              {request.problemDescription && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    Customer Problem Notes:
                  </span>
                  <p className="text-slate-700 italic">"{request.problemDescription}"</p>
                </div>
              )}
            </div>

            {/* Call & Chat CTAs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onCall}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#19C37D]" />
                <span>CALL CUSTOMER</span>
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="py-2.5 px-3 rounded-xl bg-[#0B1F4B] hover:bg-[#163D7A] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>LIVE CHAT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Dispatch Map */}
        <div className="lg:col-span-7 h-[480px] lg:h-[620px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <InteractiveMapView
            customerCoords={request.customerLocation.coords}
            mechanicLiveLocation={mechanicLiveCoords || request.mechanicLocation}
            selectedMechanicId={request.mechanicId}
            activeRoute={true}
            trackingStatus={`Dispatching to ${request.customerName}`}
            height="100%"
          />
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4 text-xs">
            <div className="border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                Job Finalization
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Complete Service on {request.vehicle.brand} {request.vehicle.model}
              </h3>
            </div>

            <form onSubmit={handleFinishJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Billed Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={100}
                    max={10000}
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Original estimate was {formatINR(request.estimatedPrice.min)} –{' '}
                  {formatINR(request.estimatedPrice.max)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Notes / Repairs Performed
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Details of the roadside troubleshooting completed..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  id="submit-job-completion-btn"
                  className="py-2.5 px-4 rounded-xl bg-[#19C37D] hover:bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  CONFIRM & BILL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
