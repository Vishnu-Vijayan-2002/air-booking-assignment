import React, { useState, useEffect } from 'react';
import { Plane, Compass, Wind, Navigation, RefreshCw, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { flightsApi } from '../api/flightsApi';

export const LiveRadarWidget = ({ flightId, initialTelemetry }) => {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [loading, setLoading] = useState(!initialTelemetry);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const res = await flightsApi.getLiveTelemetry(flightId);
      setTelemetry(res.data);
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTelemetry && flightId) {
      fetchTelemetry();
    }
  }, [flightId]);

  useEffect(() => {
    if (!autoRefresh || !flightId) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, flightId]);

  if (loading) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3">Connecting to OpenSky Radar Transponder...</p>
      </div>
    );
  }

  const progress = telemetry?.progress_percentage ?? 45;

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Radar Grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

      {/* Top Bar */}
      <div className="relative flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-sky-400">
                {telemetry?.flight_number || 'AI-101'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                {telemetry?.provider || 'OpenSky Network Feed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {telemetry?.origin?.city} ({telemetry?.origin?.code}) &rarr; {telemetry?.destination?.city} ({telemetry?.destination?.code})
            </p>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          title="Refresh Radar Telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Radar Display Area */}
      <div className="relative py-6">
        {/* Progress Corridor */}
        <div className="relative flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-mono font-bold text-slate-300">{telemetry?.origin?.code}</span>
          <span className="text-[11px] font-mono text-sky-400 font-semibold">{telemetry?.flight_phase}</span>
          <span className="text-xs font-mono font-bold text-slate-300">{telemetry?.destination?.code}</span>
        </div>

        {/* Great-Circle Flight Path Visualizer */}
        <div className="relative w-full h-8 flex items-center">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Plane Icon Positioned along path */}
          <div
            className="absolute -top-1 transition-all duration-700"
            style={{ left: `calc(${progress}% - 14px)` }}
          >
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/50 ring-2 ring-white">
              <Plane className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
          <span>Departed: {telemetry?.departure_time ? new Date(telemetry.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '08:30'}</span>
          <span className="text-sky-300 font-bold">{progress}% completed</span>
          <span>ETA: {telemetry?.arrival_time ? new Date(telemetry.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '14:45'}</span>
        </div>
      </div>

      {/* Telemetry Gauge Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            Altitude
          </div>
          <p className="text-base font-mono font-bold text-white">
            {telemetry?.altitude_ft?.toLocaleString() || 36000} <span className="text-xs text-slate-400">ft</span>
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            Airspeed
          </div>
          <p className="text-base font-mono font-bold text-white">
            {telemetry?.speed_kts || 485} <span className="text-xs text-slate-400">kts</span>
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Heading
          </div>
          <p className="text-base font-mono font-bold text-white">
            {telemetry?.heading_deg || 298}&deg; <span className="text-xs text-slate-400">NW</span>
          </p>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium mb-1">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            Live Coordinates
          </div>
          <p className="text-xs font-mono font-semibold text-slate-200 truncate">
            {telemetry?.latitude?.toFixed(2)}&deg;N, {telemetry?.longitude?.toFixed(2)}&deg;E
          </p>
        </div>
      </div>
    </div>
  );
};

