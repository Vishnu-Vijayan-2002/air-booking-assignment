import React from 'react';
import { Plane, Clock, ShieldCheck, ArrowRight, Compass, Users } from 'lucide-react';
import { FlightStatusBadge } from './StatusBadge';

const AIRLINE_THEMES = {
  AI: { bg: 'bg-red-700', text: 'text-white', badge: 'bg-red-50 text-red-700 border-red-200' },
  EK: { bg: 'bg-rose-900', text: 'text-white', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  BA: { bg: 'bg-blue-900', text: 'text-white', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  SQ: { bg: 'bg-amber-900', text: 'text-white', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  '6E': { bg: 'bg-indigo-600', text: 'text-white', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  LH: { bg: 'bg-slate-900', text: 'text-amber-400', badge: 'bg-amber-50 text-slate-800 border-amber-200' },
  DL: { bg: 'bg-blue-950', text: 'text-white', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  QR: { bg: 'bg-fuchsia-950', text: 'text-white', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
};

export const FlightCard = ({ flight, onSelect, onOpenRadar }) => {
  const theme = AIRLINE_THEMES[flight.airline_code] || {
    bg: 'bg-slate-900',
    text: 'text-white',
    badge: 'bg-slate-50 text-slate-700 border-slate-200'
  };
  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Airline & Route Overview */}
        <div className="flex-1 space-y-4">
          {/* Top row: Airline info & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center font-black text-xs tracking-wider shadow-md`}>
                {flight.airline_code}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">{flight.airline}</h4>
                <p className="text-xs text-slate-500">
                  {flight.flight_number} &bull; {flight.aircraft_type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FlightStatusBadge status={flight.status} delayMinutes={flight.delay_minutes} />
            </div>
          </div>

          {/* Middle: Route & Times */}
          <div className="grid grid-cols-3 items-center py-2">
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {formatTime(flight.departure_time)}
              </p>
              <p className="text-base font-bold text-slate-800">{flight.origin_code}</p>
              <p className="text-xs text-slate-500 truncate max-w-[140px]">{flight.origin_city}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(flight.departure_time)}</p>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {flight.duration}
              </span>
              <div className="w-full flex items-center justify-center relative">
                <div className="h-0.5 w-full bg-slate-200"></div>
                <div className="absolute w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center">
                  <Plane className="w-3 h-3 rotate-90 text-sky-600" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 mt-1">Non-stop</span>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {formatTime(flight.arrival_time)}
              </p>
              <p className="text-base font-bold text-slate-800">{flight.destination_code}</p>
              <p className="text-xs text-slate-500 truncate max-w-[140px] ml-auto">{flight.destination_city}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(flight.arrival_time)}</p>
            </div>
          </div>

          {/* Bottom Specs */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Terminal: <strong className="text-slate-700">{flight.terminal || 'T3'}</strong></span>
            <span>Gate: <strong className="text-slate-700">{flight.gate || 'B12'}</strong></span>
            <span className="flex items-center gap-1 text-sky-700">
              <Users className="w-3.5 h-3.5" />
              {flight.available_seats} seats remaining
            </span>
          </div>
        </div>

        {/* Right: Pricing & Action Buttons */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 gap-3">
          <div className="text-left lg:text-right">
            <span className="text-xs text-slate-400 font-medium">Starting from</span>
            <p className="text-3xl font-black text-slate-900 leading-none">
              ₹{parseFloat(flight.price).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-400">per passenger</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRadar && (
              <button
                onClick={() => onOpenRadar(flight)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition-colors"
                title="View Live Telemetry Radar"
              >
                <Compass className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSelect(flight)}
              disabled={flight.available_seats <= 0 || flight.status === 'CANCELLED'}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>Book Flight</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

