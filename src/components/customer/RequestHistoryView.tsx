import React, { useState } from 'react';
import { AssistanceRequest } from '../../types';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Lock,
  MapPin,
  Printer,
  Receipt,
  ShieldCheck,
  Star,
  Wrench,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { ReceiptModal } from './ReceiptModal';

interface RequestHistoryViewProps {
  requests: AssistanceRequest[];
  activeRequest: AssistanceRequest | null;
  onViewActive: () => void;
}

export const RequestHistoryView: React.FC<RequestHistoryViewProps> = ({
  requests,
  activeRequest,
  onViewActive,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [selectedDetailReq, setSelectedDetailReq] = useState<AssistanceRequest | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<AssistanceRequest | null>(null);
  const [receiptRequest, setReceiptRequest] = useState<AssistanceRequest | null>(null);

  const allRequests = [
    ...(activeRequest ? [activeRequest] : []),
    ...requests.filter((r) => r.id !== activeRequest?.id),
  ];

  const filtered = allRequests.filter((r) => {
    if (activeTab === 'active') {
      return r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
    }
    if (activeTab === 'completed') {
      return r.status === 'COMPLETED';
    }
    if (activeTab === 'cancelled') {
      return r.status === 'CANCELLED';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-heading text-slate-900">Assistance Requests</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {allRequests.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Review past roadside jobs, complete pending service payments, and view tax receipts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-[#0B1F4B] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any assistance requests in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((req) => {
            const isActive = req.status !== 'COMPLETED' && req.status !== 'CANCELLED';
            const isCompleted = req.status === 'COMPLETED';
            const isPaid = isCompleted && req.paymentStatus === 'PAID';
            const isPaymentDue = isCompleted && req.paymentStatus !== 'PAID';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isActive
                    ? 'border-[#00C2FF] ring-2 ring-[#00C2FF]/20 shadow-md'
                    : isPaymentDue
                    ? 'border-amber-300 bg-amber-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#00C2FF]/15 text-[#0B1F4B] border border-[#00C2FF]/40'
                          : isCompleted
                          ? 'bg-[#19C37D]/15 text-[#19C37D]'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {req.status}
                    </span>

                    {/* Payment Status Badges */}
                    {isCompleted && (
                      isPaid ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>PAID</span>
                          {req.paymentMethod && (
                            <span className="font-normal text-emerald-700">({req.paymentMethod})</span>
                          )}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>PAYMENT DUE</span>
                        </span>
                      )
                    )}

                    <span className="text-xs text-slate-400 font-mono">Job #{req.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{req.mechanicShopName}</span>
                      <ShieldCheck className="w-4 h-4 text-[#19C37D]" />
                    </h4>
                    <p className="text-xs text-slate-500">
                      Problem: <span className="font-bold text-slate-700">{req.problem}</span> •
                      Vehicle: {req.vehicle.brand} {req.vehicle.model} ({req.vehicle.registrationNumber})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.customerLocation.address}</span>
                  </div>
                </div>

                {/* Right: Pricing & CTAs */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2.5">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {isCompleted ? (isPaid ? 'Billed & Settled' : 'Payable Amount') : 'Estimated Cost'}
                    </span>
                    <span className="text-base font-bold text-[#0B1F4B] font-mono">
                      {isCompleted && req.finalPrice
                        ? formatINR(req.finalPrice)
                        : `${formatINR(req.estimatedPrice.min)} – ${formatINR(req.estimatedPrice.max)}`}
                    </span>
                    {req.rating && (
                      <div className="flex items-center md:justify-end gap-1 text-xs text-amber-500 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{req.rating} Stars</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <button
                        type="button"
                        onClick={onViewActive}
                        className="px-4 py-2 bg-[#0B1F4B] hover:bg-[#163D7A] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#00C2FF]" />
                        <span>LIVE TRACKING</span>
                      </button>
                    ) : isCompleted ? (
                      <>
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setReceiptRequest(req)}
                            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>INVOICE</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            id={`pay-now-btn-${req.id}`}
                            onClick={() => setPaymentRequest(req)}
                            className="px-4 py-1.5 bg-[#19C37D] hover:bg-[#15A86B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm animate-pulse hover:animate-none"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>PAY NOW</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedDetailReq(req)}
                          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>DETAILS</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedDetailReq(req)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>DETAILS</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedDetailReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 animate-scaleUp text-xs text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assistance Record
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Job #{selectedDetailReq.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailReq(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Workshop:</span>
                <span className="font-bold text-slate-900">{selectedDetailReq.mechanicShopName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Technician:</span>
                <span>{selectedDetailReq.mechanicOwnerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Vehicle:</span>
                <span>
                  {selectedDetailReq.vehicle.brand} {selectedDetailReq.vehicle.model}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Problem:</span>
                <span className="font-bold text-[#0B1F4B]">{selectedDetailReq.problem}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Total Billed:</span>
                <span className="font-bold text-base text-[#19C37D]">
                  {formatINR(selectedDetailReq.finalPrice || 450)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Payment Status:</span>
                <span
                  className={`font-bold uppercase ${
                    selectedDetailReq.paymentStatus === 'PAID'
                      ? 'text-[#19C37D]'
                      : 'text-amber-600'
                  }`}
                >
                  {selectedDetailReq.paymentStatus === 'PAID'
                    ? `Paid (${selectedDetailReq.paymentMethod || 'UPI'})`
                    : 'Payment Due'}
                </span>
              </div>
              {selectedDetailReq.review && (
                <div className="pt-2">
                  <span className="font-bold text-slate-700 block mb-1">Your Review:</span>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 italic">
                    "{selectedDetailReq.review}"
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {selectedDetailReq.status === 'COMPLETED' &&
                (selectedDetailReq.paymentStatus === 'PAID' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const req = selectedDetailReq;
                      setSelectedDetailReq(null);
                      setReceiptRequest(req);
                    }}
                    className="flex-1 py-2.5 bg-[#0B1F4B] hover:bg-[#163D7A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>View Tax Receipt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const req = selectedDetailReq;
                      setSelectedDetailReq(null);
                      setPaymentRequest(req);
                    }}
                    className="flex-1 py-2.5 bg-[#19C37D] hover:bg-[#15A86B] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Proceed to Pay</span>
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setSelectedDetailReq(null)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Payment Processing Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={!!paymentRequest}
        request={paymentRequest}
        onClose={() => setPaymentRequest(null)}
      />

      {/* Tax Invoice & Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptRequest}
        request={receiptRequest}
        onClose={() => setReceiptRequest(null)}
      />
    </div>
  );
};

