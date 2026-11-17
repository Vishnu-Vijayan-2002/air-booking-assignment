import React, { useState, useEffect } from 'react';
import { Compass, Plane, Radio, RefreshCw, Navigation, Wind, ShieldCheck, MapPin } from 'lucide-react';
import { flightsApi } from '../api/flightsApi';
import { LiveRadarWidget } from '../components/LiveRadarWidget';
import { FlightStatusBadge } from '../components/StatusBadge';

export const LiveTrackingPage = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlights();
  }, []);

  const fetchActiveFlights = async () => {
    setLoading(true);
    try {
      const res = await flightsApi.searchFlights({});
      const list = res.data.results || [];
      setFlights(list);
      if (list.length > 0 && !selectedFlight) {
        setSelectedFlight(list[0]);
      }
    } catch (err) {
      console.error("Failed to load flights for radar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AirLabs &bull; OpenSky Network Transponder Feed
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Compass className="w-8 h-8 text-sky-400" />
              Live Flight Radar & Telemetry Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time geospatial tracking, altitude profiles, airspeed telemetry, and arrival estimates
            </p>
          </div>

          <button
            onClick={fetchActiveFlights}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Stream
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Active Radar Screen */}
          <div className="lg:col-span-8 space-y-6">
            {selectedFlight ? (
              <LiveRadarWidget flightId={selectedFlight.id} />
            ) : (
              <div className="bg-slate-900 rounded-3xl p-12 text-center text-slate-400 border border-slate-800">
                <Plane className="w-12 h-12 text-slate-700 mx-auto -rotate-45 mb-3" />
                <p>Select a flight from the roster to monitor radar telemetry</p>
              </div>
            )}

            {/* Global Airspace Telemetry Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Aircraft</span>
                <p className="text-2xl font-black text-white mt-1">{flights.length}</p>
                <p className="text-[11px] text-emerald-400 mt-1">All transponders operational</p>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Feed Provider</span>
                <p className="text-xl font-bold text-sky-400 mt-1">OpenSky ADS-B</p>
                <p className="text-[11px] text-slate-400 mt-1">Great-Circle Geospatial Interp.</p>
              </div>
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Average Cruising Speed</span>
                <p className="text-2xl font-black text-white mt-1">482 <span className="text-xs text-slate-400 font-normal">kts</span></p>
                <p className="text-[11px] text-slate-400 mt-1">~892 km/h ground speed</p>
              </div>
            </div>
          </div>

          {/* Right: Flight Selector Roster */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Active Airspace Roster</span>
              <span className="text-xs text-sky-400 font-normal">{flights.length} Flights</span>
            </h3>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {flights.map((flight) => {
                const isSelected = selectedFlight?.id === flight.id;
                return (
                  <button
                    key={flight.id}
                    onClick={() => setSelectedFlight(flight)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-white">
                          {flight.flight_number}
                        </span>
                        <span className="text-xs text-slate-400">
                          {flight.airline}
                        </span>
                      </div>
                      <FlightStatusBadge status={flight.status} delayMinutes={flight.delay_minutes} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span>{flight.origin_code} ({flight.origin_city})</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span>{flight.destination_code} ({flight.destination_city})</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{flight.aircraft_type}</span>
                      <span className="text-emerald-400 font-semibold">{flight.available_seats} seats avail.</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

