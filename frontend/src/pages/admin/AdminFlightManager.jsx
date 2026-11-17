import React, { useState, useEffect } from 'react';
import { Plane, Plus, Edit2, Check, X, Clock, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { FlightStatusBadge } from '../../components/StatusBadge';

export const AdminFlightManager = ({ onFlightUpdated }) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [statusUpdateId, setStatusUpdateId] = useState(null);
  const [toast, setToast] = useState('');

  // New Flight Form state
  const [formData, setFormData] = useState({
    flight_number: '',
    airline: '',
    airline_code: '',
    aircraft_type: 'Boeing 787-9',
    origin_city: '',
    origin_airport: '',
    origin_code: '',
    origin_latitude: 28.5562,
    origin_longitude: 77.1000,
    destination_city: '',
    destination_airport: '',
    destination_code: '',
    destination_latitude: 51.4700,
    destination_longitude: -0.4543,
    departure_time: '',
    arrival_time: '',
    price: '',
    total_seats: 180,
    available_seats: 180,
    status: 'ON_TIME',
    gate: 'B12',
    terminal: 'T3',
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFlights();
      setFlights(res.data.results || []);
    } catch (err) {
      console.error("Failed to load flights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (flightId, newStatus, delayMinutes = 0) => {
    setStatusUpdateId(flightId);
    try {
      await adminApi.updateFlightStatus(flightId, {
        status: newStatus,
        delay_minutes: delayMinutes,
      });
      setToast(`Flight status updated to ${newStatus}`);
      fetchFlights();
      if (onFlightUpdated) onFlightUpdated();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.detail || err.message));
    } finally {
      setStatusUpdateId(null);
    }
  };

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createFlight(formData);
      setShowCreateModal(false);
      setToast(`Flight ${formData.flight_number} created successfully!`);
      fetchFlights();
      if (onFlightUpdated) onFlightUpdated();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      alert("Failed to create flight: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Flight Inventory & Operational Status</h3>
          <p className="text-xs text-slate-500">
            Real-time status controls for delays, boarding alerts, and route scheduling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFlights}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Flight</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Flight Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : flights.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No flights found. Click "Add New Flight" to schedule routes.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Flight</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Departure & Arrival</th>
                  <th className="px-6 py-4">Seats & Fare</th>
                  <th className="px-6 py-4">Live Status</th>
                  <th className="px-6 py-4 text-right">Quick Status Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-slate-900">{f.flight_number}</p>
                      <p className="text-[11px] text-slate-500">{f.airline}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{f.aircraft_type}</p>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      <p className="font-bold text-slate-900">
                        {f.origin_code} &rarr; {f.destination_code}
                      </p>
                      <p className="text-[11px] text-slate-500">{f.origin_city} to {f.destination_city}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <p>
                        Dep: <strong>{new Date(f.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Date: {new Date(f.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">${f.price}</p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {f.available_seats} / {f.total_seats} avail.
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <FlightStatusBadge status={f.status} delayMinutes={f.delay_minutes} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* Interactive inline status update selector */}
                      <select
                        value={f.status}
                        onChange={(e) => {
                          const newSt = e.target.value;
                          const delay = newSt === 'DELAYED' ? 30 : 0;
                          handleQuickStatusChange(f.id, newSt, delay);
                        }}
                        disabled={statusUpdateId === f.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="ON_TIME">On-time</option>
                        <option value="BOARDING">Boarding</option>
                        <option value="DELAYED">Delayed (+30m)</option>
                        <option value="DEPARTED">Departed (In Flight)</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="SCHEDULED">Scheduled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Flight Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-600 -rotate-45" />
                Schedule New Flight
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlight} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Flight Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-202"
                    value={formData.flight_number}
                    onChange={(e) => setFormData({ ...formData, flight_number: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Airline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air India"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Airline Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI"
                    value={formData.airline_code}
                    onChange={(e) => setFormData({ ...formData, airline_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              {/* Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DEL"
                    value={formData.origin_code}
                    onChange={(e) => setFormData({ ...formData, origin_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Airport</label>
                  <input
                    type="text"
                    required
                    placeholder="Indira Gandhi Intl"
                    value={formData.origin_airport}
                    onChange={(e) => setFormData({ ...formData, origin_airport: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dest. Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LHR"
                    value={formData.destination_code}
                    onChange={(e) => setFormData({ ...formData, destination_code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dest. City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. London"
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dest. Airport</label>
                  <input
                    type="text"
                    required
                    placeholder="Heathrow Airport"
                    value={formData.destination_airport}
                    onChange={(e) => setFormData({ ...formData, destination_airport: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departure Datetime</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Arrival Datetime</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Pricing & Seats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="499.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value, available_seats: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gate</label>
                  <input
                    type="text"
                    value={formData.gate}
                    onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Terminal</label>
                  <input
                    type="text"
                    value={formData.terminal}
                    onChange={(e) => setFormData({ ...formData, terminal: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  Create Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
