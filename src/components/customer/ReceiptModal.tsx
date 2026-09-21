import React from 'react';
import { AssistanceRequest } from '../../types';
import { CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface ReceiptModalProps {
  isOpen: boolean;
  request: AssistanceRequest | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, request, onClose }) => {
  if (!isOpen || !request) return null;

  const basePrice = request.finalPrice || 450;
  const platformFee = request.paymentBreakdown?.platformFee || 29;
  const gst = request.paymentBreakdown?.gstAmount || 5;
  const total = request.paymentBreakdown?.totalAmount || basePrice + platformFee + gst;

  const invoiceNo = request.invoiceNumber || 'INV-2026-' + request.id.replace('req_', '');
  const txnId = request.transactionId || 'TXN_UPI_' + request.id.slice(-6) + '821';
  const methodTitle =
    request.paymentBreakdown?.methodTitle ||
    (request.paymentMethod ? `${request.paymentMethod} Payment` : 'UPI (Google Pay)');
  const paidAt = request.paidAt || request.updatedAt || new Date().toISOString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        id="tax-invoice-receipt-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-scaleUp text-xs"
      >
        {/* Header Strip */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/40 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Tax Invoice & Receipt</span>
                <span className="text-[10px] bg-[#19C37D]/20 text-[#19C37D] px-1.5 py-0.2 rounded font-mono font-semibold">
                  PAID
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #{invoiceNo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5 text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Service Center</span>
              <span className="font-bold text-slate-900 block">{request.mechanicShopName}</span>
              <span className="text-slate-500">Lead Tech: {request.mechanicOwnerName}</span>
              <span className="text-slate-400 block font-mono">GSTIN: 37AAECR1294K1ZG</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Customer / Vehicle</span>
              <span className="font-bold text-slate-900 block">{request.customerName}</span>
              <span className="text-slate-600 block">
                {request.vehicle.brand} {request.vehicle.model}
              </span>
              <span className="font-mono text-slate-500">{request.vehicle.registrationNumber}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">Invoice Line Items</span>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>{request.problem} On-Site Diagnostic & Labor</span>
                <span className="font-mono font-medium text-slate-900">{formatINR(basePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Roadside Convenience & SOS Dispatch</span>
                <span className="font-mono font-medium text-slate-900">{formatINR(platformFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Integrated GST (18%)</span>
                <span className="font-mono font-medium text-slate-900">{formatINR(gst)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Paid</span>
                <span className="font-mono text-[#0B1F4B]">{formatINR(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details info */}
          <div className="bg-[#19C37D]/5 border border-[#19C37D]/20 rounded-xl p-3 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Payment Channel:</span>
              <span className="font-bold text-slate-900">{methodTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Ref:</span>
              <span className="font-mono font-bold text-slate-900">{txnId}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Timestamp:</span>
              <span className="text-slate-700">
                {new Date(paidAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                • {new Date(paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-[#0B1F4B] hover:bg-[#163D7A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
