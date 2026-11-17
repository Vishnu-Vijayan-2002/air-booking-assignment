import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Plane, Clock, Calendar, AlertCircle, XCircle, Compass, Printer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { bookingsApi } from '../api/bookingsApi';
import { FlightStatusBadge } from '../components/StatusBadge';
import { TicketModal } from '../components/TicketModal';
import { LiveRadarWidget } from '../components/LiveRadarWidget';

export const MyTripsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, CONFIRMED, CANCELLED

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [radarFlightId, setRadarFlightId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'ALL' ? null : filter;
      const res = await bookingsApi.getUserBookings(statusParam);
      setBookings(res.data.results || []);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this flight reservation? Seats will be restored to inventory and refund will be processed.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingsApi.cancelBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Ticket className="w-8 h-8 text-sky-600" />
              My Trips & Boarding Passes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your confirmed flight reservations, check live flight radar, and print e-tickets
            </p>
          </div>

          <Link
            to="/flights"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <Plane className="w-4 h-4 -rotate-45" />
            Book New Flight
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          {[
            { id: 'ALL', label: 'All Trips' },
            { id: 'CONFIRMED', label: 'Confirmed / Upcoming' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Plane className="w-8 h-8 -rotate-45" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Trips Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reserved any flights matching this filter. Explore scheduled flights and secure your boarding pass today.
            </p>
            <Link
              to="/flights"
              className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-sky-700"
            >
              Explore Flights
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const flight = booking.flight;
              const isCancelled = booking.booking_status === 'CANCELLED';

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-200 relative overflow-hidden ${
                    isCancelled ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-sky-300 hover:shadow-lg'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Booking Ref:
                      </span>
                      <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                        {booking.booking_reference}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {booking.booking_status_display}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Flight Status:</span>
                      <FlightStatusBadge status={flight.status} delayMinutes={flight.delay_minutes} />
                    </div>
                  </div>

                  {/* Flight Overview Grid */}
                  <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Airline & Aircraft */}
                    <div className="md:col-span-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs mb-2">
                        {flight.airline_code}
                      </div>
                      <h4 className="font-bold text-slate-900 leading-tight">{flight.airline}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Flight {flight.flight_number} &bull; {flight.aircraft_type}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Travel Date: <strong className="text-slate-700">{formatDate(flight.departure_time)}</strong>
                      </p>
                    </div>

                    {/* Route Breakdown */}
                    <div className="md:col-span-6 grid grid-cols-3 items-center text-center">
                      <div className="text-left">
                        <p className="text-2xl font-black text-slate-900">{flight.origin_code}</p>
                        <p className="text-xs font-semibold text-slate-700">{flight.origin_city}</p>
                        <p className="text-xs text-sky-600 font-bold mt-1">{formatTime(flight.departure_time)}</p>
                        <span className="text-[11px] text-slate-400">Terminal {flight.terminal || 'T3'}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400 font-semibold mb-1">{flight.duration}</span>
                        <div className="w-full flex items-center justify-center relative">
                          <div className="h-0.5 w-full bg-slate-200"></div>
                          <div className="absolute w-6 h-6 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                            <Plane className="w-3 h-3 rotate-90" />
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1">Non-stop</span>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">{flight.destination_code}</p>
                        <p className="text-xs font-semibold text-slate-700">{flight.destination_city}</p>
                        <p className="text-xs text-sky-600 font-bold mt-1">{formatTime(flight.arrival_time)}</p>
                        <span className="text-[11px] text-slate-400">Gate {flight.gate || 'B12'}</span>
                      </div>
                    </div>

                    {/* Passenger & Seat details */}
                    <div className="md:col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Passenger:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[130px]">{booking.passenger_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Seat:</span>
                        <span className="font-extrabold text-sky-600">{booking.seat_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Cabin Class:</span>
                        <span className="font-semibold text-slate-800">{booking.seat_class_display}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500 font-medium">Total Paid:</span>
                        <span className="font-bold text-emerald-600">₹{parseFloat(booking.total_price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(booking)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Boarding Pass</span>
                      </button>

                      <button
                        onClick={() => setRadarFlightId(flight.id)}
                        className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-200"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Live Radar Status</span>
                      </button>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors hover:underline"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Live Radar Telemetry Modal */}
      {radarFlightId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setRadarFlightId(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg"
              >
                Close Radar
              </button>
            </div>
            <LiveRadarWidget flightId={radarFlightId} />
          </div>
        </div>
      )}
    </div>
  );
};

