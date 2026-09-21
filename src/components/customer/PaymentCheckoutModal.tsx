import React, { useEffect, useState } from 'react';
import { AssistanceRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Lock,
  Printer,
  QrCode,
  RotateCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { formatINR } from '../../utils/geo';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  request: AssistanceRequest | null;
  onClose: () => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'cash';
type CheckoutStep = 'METHOD_SELECT' | 'GATEWAY_PROCESSING' | 'OTP_VERIFY' | 'SUCCESS';

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  request,
  onClose,
}) => {
  const { processPayment } = useApp();

  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('METHOD_SELECT');

  // UPI State
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrTimer, setQrTimer] = useState(300);

  // Card State
  const [cardNumber, setCardNumber] = useState('4532 8921 7364 9012');
  const [cardName, setCardName] = useState('Sanju Kumar');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('382');
  const [saveCard, setSaveCard] = useState(true);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // 3DS OTP State
  const [otpValue, setOtpValue] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(25);
  const [generatedTxnId, setGeneratedTxnId] = useState('');
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState('');
  const [paidMethodTitle, setPaidMethodTitle] = useState('');

  // Pricing calculations
  const baseServicePrice = request?.finalPrice || 450;
  const platformFee = 29;
  const gstAmount = 5;
  const totalPayable = baseServicePrice + platformFee + gstAmount;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('METHOD_SELECT');
      setActiveTab('upi');
      setOtpValue('');
      setOtpResendTimer(25);
      setShowQrCode(false);
      setQrTimer(300);
    }
  }, [isOpen]);

  // QR Code Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && showQrCode && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, showQrCode, qrTimer]);

  // OTP Resend countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkoutStep === 'OTP_VERIFY' && otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, otpResendTimer]);

  if (!isOpen || !request) return null;

  // Format Card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  // Trigger Checkout
  const handleInitiatePayment = () => {
    if (activeTab === 'cash') {
      // Cash handover is verified on spot without OTP
      finalizePayment('CASH', 'Cash on Spot (Direct to Technician)', 'Physical Cash');
      return;
    }

    setCheckoutStep('GATEWAY_PROCESSING');

    // Simulate 1.2s bank handshake
    setTimeout(() => {
      setCheckoutStep('OTP_VERIFY');
      setOtpResendTimer(25);
    }, 1200);
  };

  const handleVerifyOtp = (customCode?: string) => {
    const code = customCode || otpValue;
    if (!code || code.length < 4) return;

    setCheckoutStep('GATEWAY_PROCESSING');

    setTimeout(() => {
      let methodTitle = 'UPI';
      let accountRef = 'sanjukumar@okhdfcbank';

      if (activeTab === 'upi') {
        if (selectedUpiApp === 'gpay') {
          methodTitle = 'Google Pay UPI';
          accountRef = 'sanjukumar@okaxis';
        } else if (selectedUpiApp === 'phonepe') {
          methodTitle = 'PhonePe UPI';
          accountRef = '9876543210@ybl';
        } else if (selectedUpiApp === 'paytm') {
          methodTitle = 'Paytm UPI';
          accountRef = '9876543210@paytm';
        } else {
          methodTitle = 'UPI';
          accountRef = customUpiId || 'user@upi';
        }
        finalizePayment('UPI', methodTitle, accountRef);
      } else if (activeTab === 'card') {
        const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '9012';
        methodTitle = `Visa Debit Card ending in ${last4}`;
        accountRef = `Card •••• ${last4}`;
        finalizePayment('CARD', methodTitle, accountRef);
      } else if (activeTab === 'netbanking') {
        methodTitle = `${selectedBank} Net Banking`;
        accountRef = `A/C •••• 4190`;
        finalizePayment('NETBANKING', methodTitle, accountRef);
      }
    }, 1500);
  };

  const finalizePayment = (
    method: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH',
    title: string,
    ref?: string
  ) => {
    const result = processPayment(request.id, {
      method,
      methodTitle: title,
      accountReference: ref,
      baseAmount: baseServicePrice,
      platformFee,
      gstAmount,
      totalAmount: totalPayable,
    });

    setGeneratedTxnId(result.transactionId);
    setGeneratedInvoiceNo(result.invoiceNumber);
    setPaidMethodTitle(title);
    setCheckoutStep('SUCCESS');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        id="payment-checkout-modal"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-scaleUp"
      >
        {/* Secure Top Banner */}
        <div className="bg-[#0B1F4B] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00C2FF]/20 flex items-center justify-center border border-[#00C2FF]/40 text-[#00C2FF]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">
                  ROAD//SIDE Pay
                </span>
                <span className="text-[10px] bg-[#19C37D]/20 text-[#19C37D] border border-[#19C37D]/30 px-1.5 py-0.2 rounded-sm font-semibold uppercase">
                  256-Bit SSL Encrypted
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Job #{request.id} • {request.mechanicShopName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Depends on current checkout step */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[80vh] space-y-5">
          {/* STEP 1: METHOD SELECT & ITEM BREAKDOWN */}
          {checkoutStep === 'METHOD_SELECT' && (
            <>
              {/* Order Invoice Preview Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B1F4B]">
                      <Wrench className="w-4 h-4 text-[#00C2FF]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {request.problem} Roadside Resolution
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Vehicle: {request.vehicle.brand} {request.vehicle.model} ({request.vehicle.registrationNumber})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Total Payable
                    </span>
                    <span className="text-lg font-bold font-mono text-[#0B1F4B]">
                      {formatINR(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Bill Breakdown Drawer */}
                <div className="border-t border-slate-200/80 pt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Labor & Diagnostics (Verified by Technician):</span>
                    <span className="font-mono font-medium">{formatINR(baseServicePrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Roadside Convenience & Dispatch:</span>
                      <span className="text-[10px] text-slate-400">24/7 priority</span>
                    </span>
                    <span className="font-mono font-medium">{formatINR(platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18% on convenience fee):</span>
                    <span className="font-mono font-medium">{formatINR(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200">
                    <span>Total Amount (Incl. All Taxes):</span>
                    <span className="font-mono text-sm text-[#19C37D]">
                      {formatINR(totalPayable)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Nav Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upi')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      activeTab === 'upi'
                        ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#0B1F4B] font-bold shadow-xs ring-2 ring-[#00C2FF]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-[#00C2FF]" />
                    <span className="text-xs">UPI / QR</span>
                    <span className="text-[10px] text-[#19C37D] font-semibold">Zero Fee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      activeTab === 'card'
                        ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#0B1F4B] font-bold shadow-xs ring-2 ring-[#00C2FF]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs">Cards</span>
                    <span className="text-[10px] text-slate-400">Debit / Credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      activeTab === 'netbanking'
                        ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#0B1F4B] font-bold shadow-xs ring-2 ring-[#00C2FF]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-amber-500" />
                    <span className="text-xs">Net Banking</span>
                    <span className="text-[10px] text-slate-400">All Indian Banks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('cash')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      activeTab === 'cash'
                        ? 'border-[#00C2FF] bg-[#00C2FF]/10 text-[#0B1F4B] font-bold shadow-xs ring-2 ring-[#00C2FF]/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Cash on Spot</span>
                    <span className="text-[10px] text-slate-400">To Technician</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: UPI CONTENT */}
              {activeTab === 'upi' && (
                <div className="space-y-4 pt-1">
                  {/* Popular Apps Radio Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'gpay', label: 'Google Pay', badge: 'GPay', color: 'text-blue-600' },
                      { id: 'phonepe', label: 'PhonePe', badge: 'Pe', color: 'text-purple-600' },
                      { id: 'paytm', label: 'Paytm UPI', badge: 'Paytm', color: 'text-sky-600' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedUpiApp(app.id as any);
                          setShowQrCode(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          selectedUpiApp === app.id && !showQrCode
                            ? 'border-[#0B1F4B] bg-slate-50 ring-1 ring-[#0B1F4B]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono text-xs ${app.color}`}>
                            {app.badge}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {app.label}
                          </span>
                        </div>
                        {selectedUpiApp === app.id && !showQrCode && (
                          <CheckCircle2 className="w-4 h-4 text-[#19C37D]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Toggle QR code vs UPI ID */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-600">
                      Or scan dynamic BharatQR / UPI code:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="text-xs font-bold text-[#00C2FF] hover:underline flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQrCode ? 'Hide QR Code' : 'Show UPI QR Code'}</span>
                    </button>
                  </div>

                  {showQrCode ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3 animate-fadeIn">
                      <div className="w-40 h-40 bg-white border border-slate-300 rounded-2xl p-2 mx-auto shadow-inner flex flex-col items-center justify-center relative">
                        {/* Simulated realistic high contrast SVG QR code */}
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                          {/* Corner alignment markers */}
                          <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" rx="2" />
                          <rect x="11" y="11" width="16" height="16" fill="currentColor" rx="1" />
                          <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" rx="2" />
                          <rect x="73" y="11" width="16" height="16" fill="currentColor" rx="1" />
                          <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" rx="2" />
                          <rect x="11" y="73" width="16" height="16" fill="currentColor" rx="1" />
                          {/* Matrix patterns */}
                          <rect x="40" y="8" width="6" height="6" fill="currentColor" />
                          <rect x="50" y="12" width="8" height="6" fill="currentColor" />
                          <rect x="40" y="24" width="18" height="6" fill="currentColor" />
                          <rect x="8" y="40" width="8" height="8" fill="currentColor" />
                          <rect x="24" y="40" width="6" height="14" fill="currentColor" />
                          <rect x="36" y="38" width="28" height="28" fill="none" stroke="#00C2FF" strokeWidth="2" rx="4" />
                          <circle cx="50" cy="52" r="8" fill="#0B1F4B" />
                          <rect x="72" y="40" width="16" height="6" fill="currentColor" />
                          <rect x="72" y="52" width="8" height="12" fill="currentColor" />
                          <rect x="40" y="72" width="12" height="8" fill="currentColor" />
                          <rect x="58" y="70" width="14" height="6" fill="currentColor" />
                          <rect x="44" y="84" width="22" height="8" fill="currentColor" />
                          <rect x="76" y="78" width="14" height="12" fill="currentColor" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] font-bold bg-white text-[#0B1F4B] px-1.5 py-0.5 rounded shadow-xs border border-slate-200">
                            ROAD//SIDE
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">
                          Scan with any UPI app (GPay, PhonePe, Paytm, CRED)
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Expires in {Math.floor(qrTimer / 60)}:
                          {(qrTimer % 60).toString().padStart(2, '0')} min
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyOtp('SIMULATED_QR_PAY')}
                        className="px-4 py-1.5 bg-[#19C37D] hover:bg-[#15A86B] text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simulate Phone Scan & Payment</span>
                      </button>
                    </div>
                  ) : (
                    /* UPI ID Input */
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={customUpiId}
                          onChange={(e) => setCustomUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@okhdfcbank or yourname@upi"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF] placeholder:text-slate-400"
                        />
                        <span className="absolute right-3 top-2.5 text-[11px] font-bold text-[#19C37D] bg-[#19C37D]/10 px-2 py-0.5 rounded">
                          Verified VPA
                        </span>
                      </div>

                      {/* Quick handle suggestions */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-400">Quick suffixes:</span>
                        {['@okhdfcbank', '@ybl', '@paytm', '@okaxis', '@sbi'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const base = customUpiId.split('@')[0] || 'sanjukumar';
                              setCustomUpiId(base + handle);
                            }}
                            className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 transition-colors"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARDS */}
              {activeTab === 'card' && (
                <div className="space-y-4 pt-1">
                  {/* Virtual Card Graphic */}
                  <div className="bg-gradient-to-tr from-slate-900 via-[#0B1F4B] to-slate-800 text-white rounded-2xl p-4 shadow-md space-y-4 relative overflow-hidden border border-white/10">
                    <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-[#00C2FF]/10 blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest text-[#00C2FF] uppercase font-bold">
                        ROAD//SIDE SECURE PASS
                      </span>
                      <div className="flex items-center gap-1 font-bold text-xs italic tracking-wider">
                        <span className="text-amber-400">VISA</span>
                        <span className="text-[9px] text-slate-300 font-normal">Debit</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">Card Number</span>
                      <div className="font-mono text-base font-bold tracking-widest text-white">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Cardholder
                        </span>
                        <span className="font-bold tracking-wide">{cardName || 'NAME ON CARD'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Expires
                        </span>
                        <span className="font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleCardExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center justify-between">
                          <span>CVV</span>
                          <span className="text-[10px] text-slate-400 font-normal">3 digits</span>
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full Name as on card"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="save-card-toggle"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="rounded border-slate-300 text-[#0B1F4B] focus:ring-[#00C2FF] w-3.5 h-3.5"
                      />
                      <label htmlFor="save-card-toggle" className="text-xs text-slate-600 select-none">
                        Securely save card with RBI Tokenization compliance
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4 pt-1">
                  <span className="text-xs text-slate-500 block">
                    Choose from popular Indian banks or select from full catalog:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'HDFC', name: 'HDFC Bank' },
                      { id: 'ICICI', name: 'ICICI Bank' },
                      { id: 'SBI', name: 'State Bank of India' },
                      { id: 'AXIS', name: 'Axis Bank' },
                      { id: 'KOTAK', name: 'Kotak Bank' },
                      { id: 'PNB', name: 'Punjab National' },
                    ].map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                          selectedBank === bank.id
                            ? 'border-[#0B1F4B] bg-slate-50 text-[#0B1F4B] ring-1 ring-[#0B1F4B]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span>{bank.name}</span>
                        {selectedBank === bank.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#19C37D]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Or select another scheduled bank:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-1 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                      <option value="INDUSIND">IndusInd Bank</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="UNION">Union Bank of India</option>
                      <option value="IDFC">IDFC FIRST Bank</option>
                      <option value="YES">Yes Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: CASH ON SPOT */}
              {activeTab === 'cash' && (
                <div className="space-y-4 pt-1">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Physical Cash Handover on Site</span>
                    </div>
                    <p className="leading-relaxed">
                      Hand the exact cash amount of{' '}
                      <span className="font-bold text-slate-900">{formatINR(totalPayable)}</span> to{' '}
                      <span className="font-semibold">{request.mechanicOwnerName}</span> ({request.mechanicShopName}).
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Upon cash receipt, your digital tax invoice and roadside warranty will be activated immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#19C37D]" />
                  <span>Guaranteed by ROAD//SIDE Safety Escrow</span>
                </div>

                <button
                  type="button"
                  id="checkout-pay-btn"
                  onClick={handleInitiatePayment}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0B1F4B] hover:bg-[#163D7A] text-white font-bold rounded-xl text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#00C2FF]" />
                  <span>
                    {activeTab === 'cash' ? 'CONFIRM CASH PAYMENT' : `PAY ${formatINR(totalPayable)} SECURELY`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* STEP 2: GATEWAY PROCESSING HANDSHAKE */}
          {checkoutStep === 'GATEWAY_PROCESSING' && (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-[#00C2FF] border-t-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full bg-slate-50 flex items-center justify-center text-[#0B1F4B]">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Connecting to Secure Bank Gateway...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Authorizing 256-bit tokenized payload with RBI-compliant payment gateway. Please do not refresh or close.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[11px] font-mono text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#19C37D] animate-pulse" />
                <span>SSL Connection Active</span>
              </div>
            </div>
          )}

          {/* STEP 3: 3D SECURE OTP SIMULATOR */}
          {checkoutStep === 'OTP_VERIFY' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Bank Gateway Brand Bar */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0B1F4B] text-white flex items-center justify-center font-bold font-mono text-[10px]">
                    3DS
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Bank 3D-Secure 2.0 Authentication
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Merchant: ROAD//SIDE Emergency Network
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {formatINR(totalPayable)}
                </span>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-600">
                  Enter the 6-digit One-Time Password (OTP) sent to your registered mobile{' '}
                  <span className="font-mono font-bold text-slate-900">+91 98*** **210</span>
                </p>

                {/* Auto demo filler helper */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 text-xs text-sky-800 flex items-center justify-between max-w-sm mx-auto">
                  <span>Demo Auto-Code: <strong className="font-mono">482910</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpValue('482910');
                      handleVerifyOtp('482910');
                    }}
                    className="px-2.5 py-1 bg-[#0B1F4B] text-white rounded-lg font-bold text-[10px] hover:bg-[#163D7A] transition-colors"
                  >
                    Auto-Fill & Authorize
                  </button>
                </div>

                {/* 6 Digit Input boxes */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-48 text-center tracking-[0.6em] text-xl font-bold font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-[#00C2FF] focus:border-[#00C2FF]"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pt-1">
                  {otpResendTimer > 0 ? (
                    <span>Resend OTP in 0:{otpResendTimer.toString().padStart(2, '0')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOtpResendTimer(25)}
                      className="text-[#00C2FF] font-bold hover:underline"
                    >
                      Resend OTP SMS
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('METHOD_SELECT')}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-otp-btn"
                  onClick={() => handleVerifyOtp()}
                  disabled={!otpValue || otpValue.length < 4}
                  className="px-6 py-2.5 bg-[#19C37D] hover:bg-[#15A86B] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>AUTHORIZE & PAY {formatINR(totalPayable)}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {checkoutStep === 'SUCCESS' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-[#19C37D]/15 text-[#19C37D] border-2 border-[#19C37D]/40 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#19C37D] uppercase tracking-wider block">
                    Transaction Approved
                  </span>
                  <h3 className="text-xl font-bold font-heading text-slate-900">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thank you. Your payment was safely received and logged.
                  </p>
                </div>
              </div>

              {/* Transaction Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-base font-bold font-mono text-[#0B1F4B]">
                    {formatINR(totalPayable)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{generatedTxnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-mono font-semibold text-slate-800">{generatedInvoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-medium text-slate-800">{paidMethodTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-medium text-slate-800">
                    {new Date().toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Workshop Paid:</span>
                  <span className="font-bold text-slate-900">{request.mechanicShopName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full sm:flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 bg-[#0B1F4B] hover:bg-[#163D7A] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Done • Return to History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
