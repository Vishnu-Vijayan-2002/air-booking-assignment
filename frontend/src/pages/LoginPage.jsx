import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Lock, Mail, AlertCircle, Clock, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const from = location.state?.from?.pathname || '/flights';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPendingApproval(false);
    setLoading(true);

    try {
      const user = await login(usernameOrEmail, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.approval_pending) {
        setIsPendingApproval(true);
        setErrorMessage(data.detail);
      } else if (data?.account_rejected) {
        setErrorMessage(data.detail);
      } else if (data?.detail) {
        setErrorMessage(data.detail);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setErrorMessage('');
    setIsPendingApproval(false);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/30 mb-4">
            <Plane className="w-6 h-6 -rotate-45" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to AirBooking</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access real-time flight reservations and trip management
          </p>
        </div>

        {/* Demo Quick-Fill Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block text-center">
            Demo Credentials (Click to Auto-fill)
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin', 'AdminPassword123!')}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 text-center transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('john_doe', 'UserPassword123!')}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 text-center transition-colors"
            >
              Approved User
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('sarah_connor', 'UserPassword123!')}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg border border-amber-200 text-center transition-colors"
              title="Click to test pending approval protection"
            >
              Pending User
            </button>
          </div>
        </div>

        {/* Pending Approval Notice */}
        {isPendingApproval && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Approval Pending</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-[11px] text-amber-600 mt-2 font-medium">
                Tip: Log in as <button onClick={() => setDemoCredentials('admin', 'AdminPassword123!')} className="underline font-bold">Admin</button> to approve this user account.
              </p>
            </div>
          </div>
        )}

        {/* General Error Notice */}
        {!isPendingApproval && errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. john_doe or john@example.com"
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all pl-10"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all pl-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

