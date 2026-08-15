import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LeaveManagement = () => {
  const { user, isEmployee } = useAuth();
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Apply Form State (Employee)
  const [applyForm, setApplyForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Approval Overlay State (HR/Admin)
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load leave types for dropdown
      const typesRes = await api.get('/leaves/types');
      setLeaveTypes(typesRes.data);

      if (isEmployee()) {
        const empRes = await api.get('/employees/me');
        const empId = empRes.data.id;
        setEmployeeId(empId);

        // Fetch Balances
        const balancesRes = await api.get(`/leaves/balances/${empId}`);
        setBalances(balancesRes.data);

        // Fetch History
        const historyRes = await api.get(`/leaves/history/${empId}`);
        setRequests(historyRes.data);
      } else {
        // Fetch HR Approvals Queue & History
        const approvalsRes = await api.get('/leaves');
        setRequests(approvalsRes.data);

        const empRes = await api.get('/employees/me');
        setEmployeeId(empRes.data.id);
      }
    } catch (e) {
      setError('Failed to fetch leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/leaves/apply', {
        employeeId,
        ...applyForm,
      });
      setSuccess('Leave request applied successfully! Awaiting review.');
      setApplyForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave request.');
    }
  };

  const handleApproveReject = async (status) => {
    if (!selectedRequest) return;
    setError('');
    setSuccess('');
    try {
      await api.post(`/leaves/approve/${selectedRequest.id}`, {
        status,
        remarks: approvalRemarks,
        approvedBy: employeeId,
      });
      setSuccess(`Leave request has been ${status.toLowerCase()} successfully!`);
      setSelectedRequest(null);
      setApprovalRemarks('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update leave request.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title Banner */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Leave Management</h1>
        <p className="text-xs text-brand-muted font-medium">
          {isEmployee() ? 'Apply for leaves and check quotas' : 'Manage employee leaves and pending requests'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
          {success}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isEmployee() ? (
        // EMPLOYEE FLOW
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Quota & Apply Forms */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Balances Card */}
            <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray space-y-4">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wide">Leave Quotas</h3>
              <div className="space-y-3">
                {balances.map((b) => (
                  <div key={b.id} className="flex justify-between items-center text-xs">
                    <span className="text-brand-muted font-medium">{b.leaveType.name}</span>
                    <span className="font-extrabold text-brand-navy">
                      {b.balance} / {b.leaveType.totalDays} Days Left
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Form */}
            <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray space-y-4">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wide">Apply for Leave</h3>
              <form onSubmit={handleApplyLeave} className="space-y-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Leave Type</label>
                  <select
                    required
                    value={applyForm.leaveTypeId}
                    onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                    className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  >
                    <option value="">Select Category</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Reason</label>
                  <textarea
                    required
                    value={applyForm.reason}
                    onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold h-20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white text-xs font-bold rounded-lg transition-all"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* History Lists */}
          <div className="lg:col-span-3 bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
            <div className="p-5 border-b border-brand-warmgray">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">My Leave History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Approver Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                  {requests.map((r) => (
                    <tr key={r.id} className="bg-brand-ivory transition-colors">
                      <td className="px-4 py-3 text-brand-navy font-medium">{r.leaveTypeName}</td>
                      <td className="px-4 py-3 text-brand-navy/80 font-normal">{r.startDate} to {r.endDate}</td>
                      <td className="px-4 py-3 text-brand-muted">{r.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                          r.status === 'APPROVED' ? 'bg-[#E3EFE5] text-[#3F7A4F]' :
                          r.status === 'REJECTED' ? 'bg-[#F5E3DD] text-[#B3543A]' : 'bg-[#EFE6CE] text-[#7A5E1F]'
                        }`}>
                          {r.status === 'APPROVED' ? 'Approved' : r.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-muted italic">{r.remarks || '---'}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">No leaves submitted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // ADMIN / HR FLOW (Approval logs + request lists)
        <div className="space-y-6">
          {/* Pending Queue */}
          <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
            <div className="p-5 border-b border-brand-warmgray bg-[#F2EDE1]">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Leaves Awaiting Action</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                  {requests.filter(r => r.status === 'PENDING').map((r) => (
                    <tr key={r.id} className="bg-brand-ivory transition-colors">
                      <td className="px-4 py-3 font-medium text-brand-navy">{r.employeeName}</td>
                      <td className="px-4 py-3 font-normal text-brand-navy/80">{r.leaveTypeName}</td>
                      <td className="px-4 py-3 text-brand-muted">{r.startDate} to {r.endDate}</td>
                      <td className="px-4 py-3 text-brand-muted italic">"{r.reason}"</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="px-3.5 py-1.5 bg-brand-navy hover:bg-[#1F2E52] text-white font-medium text-xs rounded-lg transition-colors"
                          >
                            Review & Decide
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.filter(r => r.status === 'PENDING').length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">All leave requests processed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit log (All) */}
          <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
            <div className="p-5 border-b border-brand-warmgray">
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Leave Audits History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                  {requests.filter(r => r.status !== 'PENDING').map((r) => (
                    <tr key={r.id} className="bg-brand-ivory transition-colors">
                      <td className="px-4 py-3 font-medium text-brand-navy">{r.employeeName}</td>
                      <td className="px-4 py-3 font-normal text-brand-navy/80">{r.leaveTypeName}</td>
                      <td className="px-4 py-3 text-brand-muted">{r.startDate} to {r.endDate}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                          r.status === 'APPROVED' ? 'bg-[#E3EFE5] text-[#3F7A4F]' : 'bg-[#F5E3DD] text-[#B3543A]'
                        }`}>
                          {r.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-muted italic">
                        {r.remarks ? `"${r.remarks}"` : '---'}
                      </td>
                    </tr>
                  ))}
                  {requests.filter(r => r.status !== 'PENDING').length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-slate-400">No leave audits registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL / REJECTION DECISION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-ivory rounded-lg p-6 border border-brand-warmgray max-w-md w-full shadow-lg space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-brand-warmgray">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wide">Review Leave request</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-brand-muted hover:text-brand-navy">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-xs space-y-2 text-brand-navy bg-[#F2EDE1] p-3 rounded-lg border border-brand-warmgray">
              <p><strong>Employee:</strong> {selectedRequest.employeeName}</p>
              <p><strong>Leave Type:</strong> {selectedRequest.leaveTypeName}</p>
              <p><strong>Date range:</strong> {selectedRequest.startDate} to {selectedRequest.endDate}</p>
              <p><strong>Reason:</strong> "{selectedRequest.reason}"</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Approver Remarks</label>
              <textarea
                placeholder="Specify approval or rejection remarks..."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-warmgray">
              <button
                type="button"
                onClick={() => handleApproveReject('REJECTED')}
                className="px-4 py-2 bg-[#B3543A] hover:opacity-90 text-white text-xs font-bold rounded-lg"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleApproveReject('APPROVED')}
                className="px-4 py-2 bg-[#3F7A4F] hover:opacity-90 text-white text-xs font-bold rounded-lg"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
