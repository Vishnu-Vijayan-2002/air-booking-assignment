import React from 'react';
import { Plane, X, Printer, Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { FlightStatusBadge } from './StatusBadge';

export const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;
  const flight = booking.flight;

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400 -rotate-45" />
            <span className="font-bold tracking-wide">Electronic Boarding Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Print E-Ticket"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-8 bg-gradient-to-b from-sky-50/50 to-white">
          {/* Top Airline Banner */}
          <div className="flex items-center justify-between pb-6 border-b border-dashed border-slate-200">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Airline</span>
              <h3 className="text-xl font-extrabold text-slate-900">{flight?.airline}</h3>
              <p className="text-xs text-sky-600 font-medium">{flight?.aircraft_type}</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Booking Ref</span>
              <p className="text-lg font-mono font-black text-slate-900 tracking-wider">
                {booking.booking_reference}
              </p>
              <FlightStatusBadge status={flight?.status} delayMinutes={flight?.delay_minutes} />
            </div>
          </div>

          {/* Route Section */}
          <div className="py-6 grid grid-cols-3 items-center text-center">
            <div className="text-left">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{flight?.origin_code}</p>
              <p className="text-sm font-semibold text-slate-700">{flight?.origin_city}</p>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{flight?.origin_airport}</p>
              <div className="mt-2 text-xs text-slate-600 font-medium">
                <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                {formatTime(flight?.departure_time)}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-400 mb-1">{flight?.duration}</span>
              <div className="w-full flex items-center justify-center relative">
                <div className="h-0.5 w-full bg-slate-300"></div>
                <div className="absolute w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Plane className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 mt-2">Non-stop</span>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{flight?.destination_code}</p>
              <p className="text-sm font-semibold text-slate-700">{flight?.destination_city}</p>
              <p className="text-xs text-slate-500 truncate max-w-[150px] ml-auto">{flight?.destination_airport}</p>
              <div className="mt-2 text-xs text-slate-600 font-medium">
                <Clock className="w-3 h-3 inline mr-1 text-slate-400" />
                {formatTime(flight?.arrival_time)}
              </div>
            </div>
          </div>

          {/* Perforated Divider with Notches */}
          <div className="relative my-4">
            <div className="border-t-2 border-dashed border-slate-300"></div>
          </div>

          {/* Passenger & Flight Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Passenger</span>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{booking.passenger_name}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Flight No.</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{flight?.flight_number}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Seat Number</span>
              <p className="text-sm font-bold text-sky-600 mt-0.5">{booking.seat_number}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Class</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{booking.seat_class_display}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Terminal</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{flight?.terminal || 'T3'}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Gate</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{flight?.gate || 'B12'}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Payment</span>
              <p className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {booking.payment_status} (${booking.total_price})
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 uppercase font-semibold">Travel Date</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{formatDate(flight?.departure_time)}</p>
            </div>
          </div>

          {/* Barcode & Boarding Notes */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 gap-4">
            <div className="flex flex-col">
              {/* Realistic SVG Barcode simulation */}
              <div className="flex items-center gap-[2px] h-10 overflow-hidden opacity-80">
                {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 3, 2, 6, 1, 5, 2, 3, 4, 1, 5, 2, 6, 3, 1, 4, 2].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }}></div>
                ))}
              </div>
              <span className="text-[10px] font-mono text-slate-500 tracking-widest mt-1 text-center">
                {booking.transaction_id || booking.booking_reference}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 text-center sm:text-right max-w-xs">
              Please be at the departure gate at least 45 minutes prior to departure. Valid photo identification is required for boarding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
