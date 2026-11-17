import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, ArrowRightLeft, Calendar, Filter, Users, Compass, AlertCircle, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { flightsApi } from '../api/flightsApi';
import { bookingsApi } from '../api/bookingsApi';
import { useAuth } from '../context/AuthContext';
import { FlightCard } from '../components/FlightCard';
import { SeatPickerModal } from '../components/SeatPickerModal';
import { PaymentModal } from '../components/PaymentModal';
import { TicketModal } from '../components/TicketModal';
import { LiveRadarWidget } from '../components/LiveRadarWidget';

export const FlightSearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search parameters
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [maxPrice, setMaxPrice] = useState(1200);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');

  // Flight data states
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [airports, setAirports] = useState({ origins: [], destinations: [], airlines: [] });

  // Booking Flow Modals
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showSeatPicker, setShowSeatPicker] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState('12A');
  const [selectedClass, setSelectedClass] = useState('ECONOMY');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Live Radar Modal
  const [radarFlight, setRadarFlight] = useState(null);

  // Load airports and initial flights
  useEffect(() => {
    fetchAirports();
    fetchFlights();
  }, []);

  const fetchAirports = async () => {
    try {
      const res = await flightsApi.getAirports();
      setAirports(res.data);
    } catch (err) {
      console.error("Failed to load airport metadata:", err);
    }
  };

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const params = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (date) params.date = date;
      if (availableOnly) params.available_only = 'true';
      if (selectedAirline) params.airline = selectedAirline;
      if (maxPrice) params.max_price = maxPrice;
      if (statusFilter) params.status = statusFilter;

      const res = await flightsApi.searchFlights(params);
      let list = res.data.results || [];

      // Client-side sorting
      if (sortBy === 'price_asc') {
        list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortBy === 'price_desc') {
        list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      } else if (sortBy === 'departure') {
        list.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
      }

      setFlights(list);
    } catch (err) {
      console.error("Failed to search flights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Step 2 & 3: Selection and Booking Flow
  const handleInitiateBooking = (flight) => {
    setSelectedFlight(flight);
    setShowSeatPicker(true);
  };

  const handleSeatSelected = (seat, cabinClass) => {
    setSelectedSeat(seat);
    setSelectedClass(cabinClass);
    setShowSeatPicker(false);
    setShowPaymentModal(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedFlight) return 0;
    let multiplier = 1.0;
    if (selectedClass === 'PREMIUM_ECONOMY') multiplier = 1.35;
    if (selectedClass === 'BUSINESS') multiplier = 2.2;
    if (selectedClass === 'FIRST') multiplier = 3.5;
    return (parseFloat(selectedFlight.price) * multiplier).toFixed(2);
  };

  const handleConfirmPayment = async (paymentDetails) => {
    setIsProcessingPayment(true);
    try {
      const payload = {
        flight_id: selectedFlight.id,
        passenger_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        passenger_email: user.email,
        passenger_phone: user.phone_number || '+1 555-0199',
        seat_number: selectedSeat,
        seat_class: selectedClass,
        seats_count: 1,
        payment_method: paymentDetails.payment_method,
      };

      const res = await bookingsApi.createBooking(payload);
      setShowPaymentModal(false);
      setConfirmedBooking(res.data.booking);
      setShowTicketModal(true);

      // Refresh flight inventory
      fetchFlights();
    } catch (err) {
      alert(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Search Box */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
          <div className="max-w-3xl mb-6">
            <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">
              AirBooking Flight Search
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Find, Track & Book Flights Worldwide
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Compare fares, check live transponder radar, and reserve seats instantly.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Origin */}
            <div className="md:col-span-3">
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                From (City / Airport)
              </label>
              <input
                type="text"
                placeholder="e.g. DEL, New Delhi, DXB"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-medium transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-center justify-center md:pt-5">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="p-2.5 rounded-full bg-white/10 hover:bg-sky-500 text-white transition-all hover:rotate-180"
                title="Swap Origin and Destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="md:col-span-3">
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                To (City / Airport)
              </label>
              <input
                type="text"
                placeholder="e.g. LHR, New York, JFK"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-medium transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Date */}
            <div className="md:col-span-3">
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm font-medium transition-all"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 md:pt-5">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2 text-sm hover:scale-[1.02]"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-sm text-slate-900">Filter Flights</h3>
                </div>
                <button
                  onClick={() => {
                    setOrigin('');
                    setDestination('');
                    setDate('');
                    setSelectedAirline('');
                    setStatusFilter('');
                    setMaxPrice(1200);
                    setAvailableOnly(true);
                    fetchFlights();
                  }}
                  className="text-xs text-sky-600 hover:underline font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                  <span>Max Ticket Price</span>
                  <span className="text-sky-600 font-bold">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onMouseUp={fetchFlights}
                  className="w-full accent-sky-600"
                />
              </div>

              {/* Airline Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Airline
                </label>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">All Airlines</option>
                  <option value="Air India">Air India</option>
                  <option value="Emirates">Emirates</option>
                  <option value="British Airways">British Airways</option>
                  <option value="Singapore Airlines">Singapore Airlines</option>
                  <option value="IndiGo">IndiGo</option>
                  <option value="Lufthansa">Lufthansa</option>
                  <option value="Delta">Delta Air Lines</option>
                  <option value="Qatar Airways">Qatar Airways</option>
                </select>
              </div>

              {/* Flight Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Operational Status
                </label>
                <div className="space-y-1.5 text-xs">
                  {['', 'ON_TIME', 'BOARDING', 'DELAYED'].map((st) => (
                    <label key={st} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status_filter"
                        checked={statusFilter === st}
                        onChange={() => setStatusFilter(st)}
                        className="text-sky-600 focus:ring-sky-500"
                      />
                      <span>
                        {st === '' ? 'All Statuses' : st.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Only Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Available seats only
                  </span>
                </label>
              </div>

              <button
                onClick={fetchFlights}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between pb-2">
              <p className="text-sm text-slate-600 font-medium">
                Found <strong className="text-slate-900">{flights.length}</strong> available flights
              </p>

              {/* Sorting */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="departure">Earliest Departure</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : flights.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Plane className="w-12 h-12 text-slate-300 mx-auto -rotate-45" />
                <h4 className="font-bold text-slate-800">No Flights Match Your Criteria</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your origin/destination filters, price threshold, or departure dates.
                </p>
                <button
                  onClick={() => {
                    setOrigin('');
                    setDestination('');
                    setDate('');
                    fetchFlights();
                  }}
                  className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl font-bold text-xs hover:bg-sky-100"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={handleInitiateBooking}
                    onOpenRadar={(f) => setRadarFlight(f)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Picker Modal */}
      {showSeatPicker && selectedFlight && (
        <SeatPickerModal
          currentSeat={selectedSeat}
          currentClass={selectedClass}
          onSelectSeat={handleSeatSelected}
          onClose={() => setShowSeatPicker(false)}
        />
      )}

      {/* Payment Simulation Modal */}
      {showPaymentModal && selectedFlight && (
        <PaymentModal
          bookingSummary={{
            flight: selectedFlight,
            passenger_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            seat_number: selectedSeat,
            seat_class: selectedClass,
            total_price: calculateTotalPrice(),
          }}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setShowPaymentModal(false)}
          isProcessing={isProcessingPayment}
        />
      )}

      {/* Confirmed E-Ticket Modal */}
      {showTicketModal && confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {/* Live Telemetry Radar Modal */}
      {radarFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setRadarFlight(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg"
              >
                Close Radar
              </button>
            </div>
            <LiveRadarWidget flightId={radarFlight.id} />
          </div>
        </div>
      )}
    </div>
  );
};
