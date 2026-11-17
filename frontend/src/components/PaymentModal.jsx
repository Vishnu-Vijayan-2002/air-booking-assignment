import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, Zap } from 'lucide-react';

export const PaymentModal = ({ bookingSummary, onConfirmPayment, onClose, isProcessing }) => {
  const [method, setMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardName, setCardName] = useState(bookingSummary?.passenger_name || 'John Doe');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  const handlePay = (e) => {
    e.preventDefault();
    onConfirmPayment({
      payment_method: method,
      card_last4: '4242',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm">Secure Payment Gateway</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Summary */}
        <div className="p-6 bg-gradient-to-br from-sky-600 to-sky-700 text-white text-center">
          <p className="text-xs uppercase tracking-wider text-sky-200 font-semibold">Total Payable Amount</p>
          <p className="text-4xl font-black mt-1">${bookingSummary?.total_price}</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs backdrop-blur-sm">
            <span>{bookingSummary?.flight?.origin_code} &rarr; {bookingSummary?.flight?.destination_code}</span>
            <span>&bull;</span>
            <span>Seat {bookingSummary?.seat_number}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <form onSubmit={handlePay} className="p-6 space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {['CREDIT_CARD', 'UPI', 'NET_BANKING'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  method === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m === 'CREDIT_CARD' ? 'Card' : m}
              </button>
            ))}
          </div>

          {method === 'CREDIT_CARD' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number (Simulated)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none pr-10 font-mono"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expires</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <Zap className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-800">Instant Demo Simulation</p>
              <p className="text-xs text-slate-500">
                Proceeding will simulate an instant successful transaction verification via {method}.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Simulating Secure Bank Gateway...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Authorize & Pay ${bookingSummary?.total_price}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL Encrypted Sandbox Gateway</span>
          </div>
        </form>
      </div>
    </div>
  );
};
