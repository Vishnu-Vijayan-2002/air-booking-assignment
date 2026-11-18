import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Search, ShieldCheck, Compass, Ticket, ArrowRight, Clock, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { flightsApi } from '../api/flightsApi';
import { FlightStatusBadge } from '../components/StatusBadge';

export const HomePage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [tickerFlights, setTickerFlights] = useState([]);

  useEffect(() => {
    flightsApi.searchFlights({})
      .then((res) => {
        setTickerFlights((res.data.results || []).slice(0, 5));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (origin) query.set('origin', origin);
    if (destination) query.set('destination', destination);
    navigate(`/flights?${query.toString()}`);
  };

  const destinations = [
    { city: 'London', code: 'LHR', country: 'United Kingdom', price: '42,500', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
    { city: 'New York', code: 'JFK', country: 'United States', price: '64,000', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80' },
    { city: 'Dubai', code: 'DXB', country: 'United Arab Emirates', price: '28,500', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
    { city: 'Singapore', code: 'SIN', country: 'Singapore', price: '31,800', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Live Operational Flight Ticker Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-4 overflow-x-auto whitespace-nowrap border-b border-slate-800 flex items-center gap-6">
        <span className="flex items-center gap-2 font-mono font-bold text-sky-400 uppercase tracking-wider shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Airspace Feed:
        </span>
        <div className="flex items-center gap-6">
          {tickerFlights.map((f) => (
            <div key={f.id} className="inline-flex items-center gap-2 text-slate-300">
              <span className="font-mono font-bold text-white">{f.flight_number}</span>
              <span>{f.origin_code} &rarr; {f.destination_code}</span>
              <FlightStatusBadge status={f.status} delayMinutes={f.delay_minutes} />
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Airspace Monitoring &bull; OpenSky Network Transponder Feeds</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Seamless Flight Bookings with <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">
              Real-Time Radar Management
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enterprise travel platform with custom administrator approval workflows, real-time OpenSky ADS-B transponder tracking, and simulated payment confirmation.
          </p>

          {/* Quick Search Card */}
          <div className="max-w-3xl mx-auto pt-6">
            <form
              onSubmit={handleQuickSearch}
              className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-white/15 shadow-2xl grid grid-cols-1 sm:grid-cols-12 gap-3 text-left"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1 px-1">
                  Origin Airport / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL (New Delhi)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1 px-1">
                  Destination Airport / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. LHR (London)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-sky-500/30 flex items-center justify-center gap-1.5 text-sm hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Quick Popular Route Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Popular Routes:</span>
              {[
                { o: 'DEL', d: 'BOM', label: 'Delhi ➔ Mumbai' },
                { o: 'DEL', d: 'LHR', label: 'Delhi ➔ London' },
                { o: 'DXB', d: 'JFK', label: 'Dubai ➔ New York' },
                { o: 'SIN', d: 'DEL', label: 'Singapore ➔ Delhi' },
              ].map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => {
                    setOrigin(route.o);
                    setDestination(route.d);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-sky-500/30 text-slate-200 hover:text-white border border-white/15 text-[11px] font-medium transition-colors"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold">
            <Link
              to="/flights"
              className="px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plane className="w-4 h-4 text-sky-600 -rotate-45" />
              <span>Browse All Flights</span>
            </Link>

            <Link
              to="/live-radar"
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 border border-white/20"
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Open Live Radar</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Approval Console</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-sky-600">Core Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Engineered For Precision & Reliability
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every feature is structured around the assignment specifications with clean RESTful practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Admin Approval Flow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              New passenger accounts start in Pending review status. Admins approve accounts, triggering Celery activation emails.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">OpenSky Radar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time flight transponder integration with live altitude, airspeed, geospatial coordinates, and flight path visualization.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Trip Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dedicated "My Trips" portal with interactive seat picking, simulated card payments, instant cancellation, and printable boarding passes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">JWT Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              SimpleJWT authentication with token auto-refresh interceptors, role enforcement, and row-level seat locking.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-600">Popular Routes</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Trending International Flights
              </h2>
            </div>
            <Link to="/flights" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
              View All Routes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((d) => (
              <div
                key={d.code}
                onClick={() => navigate(`/flights?destination=${d.code}`)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={d.img}
                    alt={d.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white font-mono font-bold text-xs">
                    {d.code}
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{d.city}</h4>
                    <p className="text-xs text-slate-500">{d.country}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">From</span>
                    <span className="font-black text-slate-900 text-lg">₹{d.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

