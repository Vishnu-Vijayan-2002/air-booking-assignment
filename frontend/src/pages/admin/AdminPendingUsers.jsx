import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Clock, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';

export const AdminPendingUsers = ({ onUserUpdated }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'emails'
  const [actionInProgress, setActionInProgress] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchPendingUsers();
    fetchEmailLogs();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingUsers();
      setPendingUsers(res.data.results || []);
    } catch (err) {
      console.error("Failed to load pending users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await authApi.getActivationEmailLogs();
      setEmailLogs(res.data || []);
    } catch (err) {
      console.error("Failed to load email logs:", err);
    }
  };

  const handleApprove = async (userId, username) => {
    setActionInProgress(userId);
    try {
      const res = await adminApi.approveUser(userId);
      setSuccessToast(`User '${username}' approved! Activation email dispatched via Celery.`);
      fetchPendingUsers();
      fetchEmailLogs();
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => setSuccessToast(''), 6000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to approve user.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (userId, username) => {
    const reason = window.prompt(`Enter rejection reason for ${username}:`, "Application does not meet eligibility requirements.");
    if (reason === null) return;

    setActionInProgress(userId);
    try {
      await adminApi.rejectUser(userId, reason);
      setSuccessToast(`User '${username}' registration was rejected.`);
      fetchPendingUsers();
      if (onUserUpdated) onUserUpdated();
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reject user.");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'pending'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Registrations ({pendingUsers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('emails');
              fetchEmailLogs();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'emails'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Sent Activation Emails Audit ({emailLogs.length})</span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchPendingUsers();
            fetchEmailLogs();
          }}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {activeSubTab === 'pending' ? (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800">Inbox Zero: No Pending Registrations</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted user registrations have been reviewed and approved. When a new passenger registers, they will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Registration Date</th>
                      <th className="px-6 py-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">@{u.username}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">{u.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <p>{u.phone_number || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400">
                            {[u.city, u.country].filter(Boolean).join(', ') || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(u.id, u.username)}
                              disabled={actionInProgress === u.id}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{actionInProgress === u.id ? 'Approving...' : 'Approve (Celery Email)'}</span>
                            </button>

                            <button
                              onClick={() => handleReject(u.id, u.username)}
                              disabled={actionInProgress === u.id}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sent Activation Emails Inspection Tab */
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-3">
            <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Celery Notification Delivery Audit</p>
              <p className="text-purple-700 mt-0.5 leading-relaxed">
                When you click "Approve", the backend triggers a Celery background task (`send_account_approval_email`) that delivers an HTML activation notification. All sent emails are recorded below for evaluation review.
              </p>
            </div>
          </div>

          {emailLogs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No activation emails dispatched yet. Approve a user to view delivery logs here.
            </div>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.subject}</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200">
                        {log.status}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.sent_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600">
                    <span>Recipient: <strong className="text-slate-900 font-mono">{log.recipient_email}</strong></span>
                    {log.task_id && <span>Celery Task ID: <code className="font-mono text-purple-600">{log.task_id.slice(0, 12)}...</code></span>}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                    {log.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

