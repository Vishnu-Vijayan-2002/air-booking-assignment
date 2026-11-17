import React, { useState } from 'react';
import { X, Check, Armchair, ShieldCheck, Sparkles } from 'lucide-react';

export const SeatPickerModal = ({ currentSeat, currentClass, onSelectSeat, onClose }) => {
  const [selectedSeat, setSelectedSeat] = useState(currentSeat || '12A');
  const [selectedClass, setSelectedClass] = useState(currentClass || 'ECONOMY');

  // Realistic occupied seats simulation
  const occupiedSeats = new Set(['1A', '2B', '3F', '7B', '8C', '9D', '11A', '12C', '14F']);

  const getSeatClassInfo = (seat) => {
    const row = parseInt(seat.replace(/\D/g, ''), 10);
    if (row <= 2) return { name: 'FIRST', label: 'First Class', multiplier: 3.5 };
    if (row <= 5) return { name: 'BUSINESS', label: 'Business Class', multiplier: 2.2 };
    if (row <= 7) return { name: 'PREMIUM_ECONOMY', label: 'Premium Economy', multiplier: 1.35 };
    return { name: 'ECONOMY', label: 'Economy Class', multiplier: 1.0 };
  };

  const handleSeatClick = (seat) => {
    if (occupiedSeats.has(seat)) return;
    setSelectedSeat(seat);
    const info = getSeatClassInfo(seat);
    setSelectedClass(info.name);
  };

  const handleConfirm = () => {
    const info = getSeatClassInfo(selectedSeat);
    onSelectSeat(selectedSeat, info.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Armchair className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold">Select Your Cabin Seat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-center gap-6 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-slate-300"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sky-600 text-white flex items-center justify-center text-[10px]">
              <Check className="w-3 h-3" />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 text-slate-400 flex items-center justify-center text-[10px]">
              &times;
            </div>
            <span>Occupied</span>
          </div>
        </div>

        {/* Cabin View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex flex-col items-center">
          {/* Airplane Nose Shape */}
          <div className="w-40 h-14 bg-white rounded-t-full border-t-2 border-x-2 border-slate-300 flex items-center justify-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cockpit</span>
          </div>

          {/* Cabin Tube */}
          <div className="w-80 bg-white border-2 border-slate-300 p-4 rounded-b-3xl shadow-sm space-y-4">
            {/* First Class: Rows 1-2 */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-amber-600 font-bold text-center">
                First Class (Rows 1-2)
              </div>
              {[1, 2].map((r) => (
                <div key={r} className="flex items-center justify-between px-4">
                  {['A', 'C'].map((col) => {
                    const seat = `${r}${col}`;
                    const isSelected = selectedSeat === seat;
                    const isOccupied = occupiedSeats.has(seat);
                    return (
                      <button
                        key={seat}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400'
                            : isOccupied
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                  <span className="text-[11px] font-bold text-slate-400 w-6 text-center">{r}</span>
                  {['D', 'F'].map((col) => {
                    const seat = `${r}${col}`;
                    const isSelected = selectedSeat === seat;
                    const isOccupied = occupiedSeats.has(seat);
                    return (
                      <button
                        key={seat}
                        disabled={isOccupied}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-2 ring-sky-400'
                            : isOccupied
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 my-2"></div>

            {/* Economy Class: Rows 6-12 */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-sky-600 font-bold text-center">
                Main Cabin (Rows 6-12)
              </div>
              {[6, 7, 8, 9, 10, 11, 12].map((r) => (
                <div key={r} className="flex items-center justify-between">
                  {/* Left 3 seats */}
                  <div className="flex gap-1">
                    {['A', 'B', 'C'].map((col) => {
                      const seat = `${r}${col}`;
                      const isSelected = selectedSeat === seat;
                      const isOccupied = occupiedSeats.has(seat);
                      return (
                        <button
                          key={seat}
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-7 h-8 rounded text-[11px] font-bold transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                              : isOccupied
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-800 border border-slate-300 hover:border-sky-500'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 w-5 text-center">{r}</span>

                  {/* Right 3 seats */}
                  <div className="flex gap-1">
                    {['D', 'E', 'F'].map((col) => {
                      const seat = `${r}${col}`;
                      const isSelected = selectedSeat === seat;
                      const isOccupied = occupiedSeats.has(seat);
                      return (
                        <button
                          key={seat}
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-7 h-8 rounded text-[11px] font-bold transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                              : isOccupied
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-800 border border-slate-300 hover:border-sky-500'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer selection banner */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Selected Seat</p>
            <p className="text-base font-extrabold text-slate-900">
              {selectedSeat} &bull; <span className="text-sky-600">{getSeatClassInfo(selectedSeat).label}</span>
            </p>
          </div>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
          >
            Confirm Seat
          </button>
        </div>
      </div>
    </div>
  );
};
