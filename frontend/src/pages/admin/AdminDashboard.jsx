import React, { useState, useEffect } from 'react';
import { Shield, Users, Plane, Ticket, DollarSign, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AdminPendingUsers } from './AdminPendingUsers';
import { AdminFlightManager } from './AdminFlightManager';
import { AdminAllUsers } from './AdminAllUsers';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'flights' | 'users'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              Administrative Operations Console
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              AirBooking Control Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review passenger approval requests, dispatch Celery notifications, and adjust flight statuses
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Statistics
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Approvals */}
          <div
            onClick={() => setActiveTab('pending')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20'
                : 'bg-white border-slate-200/80 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'pending' ? 'text-amber-100' : 'text-slate-400'}`}>
                Pending Approvals
              </span>
              <Clock className={`w-5 h-5 ${activeTab === 'pending' ? 'text-white' : 'text-amber-500'}`} />
            </div>
            <p className="text-3xl font-black mt-2">
              {stats?.users?.pending ?? 0}
            </p>
            <p className={`text-[11px] mt-1 font-medium ${activeTab === 'pending' ? 'text-amber-100' : 'text-amber-700'}`}>
              Requires administrator review & activation
            </p>
          </div>

          {/* Total Revenue */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gross Revenue
              </span>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              ₹{stats?.bookings?.total_revenue ? stats.bookings.total_revenue.toLocaleString('en-IN') : '0'}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              {stats?.bookings?.confirmed ?? 0} confirmed simulated bookings
            </p>
          </div>

          {/* Active Flights */}
          <div
            onClick={() => setActiveTab('flights')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'flights'
                ? 'bg-sky-600 text-white border-sky-700 shadow-lg shadow-sky-600/20'
                : 'bg-white border-slate-200/80 hover:border-sky-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'flights' ? 'text-sky-100' : 'text-slate-400'}`}>
                Active Flights
              </span>
              <Plane className={`w-5 h-5 ${activeTab === 'flights' ? 'text-white' : 'text-sky-500'} -rotate-45`} />
            </div>
            <p className="text-3xl font-black mt-2">
              {stats?.flights?.active ?? 0}
            </p>
            <p className={`text-[11px] mt-1 font-medium ${activeTab === 'flights' ? 'text-sky-100' : 'text-slate-500'}`}>
              {stats?.flights?.on_time ?? 0} on-time &bull; {stats?.flights?.delayed ?? 0} delayed
            </p>
          </div>

          {/* Total Users */}
          <div
            onClick={() => setActiveTab('users')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-700 text-white border-purple-800 shadow-lg shadow-purple-700/20'
                : 'bg-white border-slate-200/80 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'users' ? 'text-purple-200' : 'text-slate-400'}`}>
                Registered Users
              </span>
              <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-white' : 'text-purple-600'}`} />
            </div>
            <p className="text-3xl font-black mt-2">
              {stats?.users?.total ?? 0}
            </p>
            <p className={`text-[11px] mt-1 font-medium ${activeTab === 'users' ? 'text-purple-200' : 'text-slate-500'}`}>
              {stats?.users?.approved ?? 0} approved accounts
            </p>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Registration Approval Workflow</span>
            {stats?.users?.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {stats.users.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('flights')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'flights'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-400 -rotate-45" />
            <span>Flight Management & Status Updates</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>User Accounts Directory</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div>
          {activeTab === 'pending' && <AdminPendingUsers onUserUpdated={fetchStats} />}
          {activeTab === 'flights' && <AdminFlightManager onFlightUpdated={fetchStats} />}
          {activeTab === 'users' && <AdminAllUsers />}
        </div>
      </div>
    </div>
  );
};

