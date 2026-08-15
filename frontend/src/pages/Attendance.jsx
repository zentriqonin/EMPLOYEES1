import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Attendance = () => {
  const { user, isEmployee } = useAuth();
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);

  // Form for marking attendance (Admin/HR only)
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    checkInTime: '09:00:00',
    checkOutTime: '18:00:00',
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      if (isEmployee()) {
        const empProfileRes = await api.get('/employees/me');
        const empId = empProfileRes.data.id;
        
        // Fetch 30 days history
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const end = today.toISOString().split('T')[0];
        
        const res = await api.get(`/attendance/history/${empId}?start=${start}&end=${end}`);
        setLogs(res.data);
      } else {
        const res = await api.get(`/attendance/date/${selectedDate}`);
        setLogs(res.data);
      }
    } catch (e) {
      setError('Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    
    if (!isEmployee()) {
      const loadEmployees = async () => {
        try {
          const res = await api.get('/employees');
          setEmployees(res.data);
          if (res.data.length > 0) {
            setForm(f => ({ ...f, employeeId: res.data[0].id }));
          }
        } catch (ignored) {}
      };
      loadEmployees();
    }
  }, [selectedDate, user]);

  const handleMarkAttendanceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Append seconds if not present
      let checkIn = form.checkInTime;
      if (checkIn && checkIn.split(':').length === 2) checkIn += ':00';
      let checkOut = form.checkOutTime;
      if (checkOut && checkOut.split(':').length === 2) checkOut += ':00';

      await api.post('/attendance', {
        ...form,
        checkInTime: form.status === 'ABSENT' || form.status === 'LEAVE' ? null : checkIn,
        checkOutTime: form.status === 'ABSENT' || form.status === 'LEAVE' ? null : checkOut,
      });
      setSuccess('Attendance logged successfully!');
      setShowMarkModal(false);
      fetchAttendance();
    } catch (err) {
      setError('Failed to mark attendance.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Attendance Logs</h1>
          <p className="text-xs text-brand-muted font-medium">
            {isEmployee() ? 'Track your check-in history' : 'Manage and view workforce daily check-in logs'}
          </p>
        </div>
        {!isEmployee() && (
          <button
            onClick={() => setShowMarkModal(true)}
            className="px-4 py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            Mark Daily Attendance
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 text-xs font-semibold rounded-xl">
          {success}
        </div>
      )}

      {/* Date Filter for Admin / HR */}
      {!isEmployee() && (
        <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col gap-1.5 w-64">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Select Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-brand-ivory border border-brand-warmgray text-xs font-medium rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-brand-navy"
            />
          </div>
          <span className="text-xs text-brand-muted font-medium italic">Showing check-ins for the selected calendar date</span>
        </div>
      )}

      {/* Logs Table Card */}
      <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                  <th className="px-4 py-3">Date</th>
                  {!isEmployee() && <th className="px-4 py-3">Employee</th>}
                  <th className="px-4 py-3">Check-In Time</th>
                  <th className="px-4 py-3">Check-Out Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                {logs.map((log) => (
                  <tr key={log.id} className="bg-brand-ivory transition-colors">
                    <td className="px-4 py-3 text-brand-navy font-medium">{log.date}</td>
                    {!isEmployee() && (
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center font-medium text-xs text-brand-gold uppercase">
                          {log.employeeName?.substring(0, 2) || 'UK'}
                        </div>
                        <div>
                          <p className="font-medium text-[13px] text-brand-navy">{log.employeeName}</p>
                          <p className="text-xs text-brand-muted font-normal">{log.employeeCode}</p>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-brand-navy/80 font-normal">{log.checkInTime || '--:--'}</td>
                    <td className="px-4 py-3 text-brand-navy/80 font-normal">{log.checkOutTime || '--:--'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                        log.status === 'PRESENT' ? 'bg-[#E3EFE5] text-[#3F7A4F]' :
                        log.status === 'LEAVE' ? 'bg-[#EFE6CE] text-[#7A5E1F]' :
                        log.status === 'HALF_DAY' ? 'bg-[#EFE6CE] text-[#7A5E1F]' : 'bg-[#F5E3DD] text-[#B3543A]'
                      }`}>
                        {log.status === 'PRESENT' ? 'Present' : 
                         log.status === 'LEAVE' ? 'Leave' :
                         log.status === 'HALF_DAY' ? 'Half day' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={isEmployee() ? 4 : 5} className="text-center py-8 text-slate-400">
                      No check-ins logged for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MARK ATTENDANCE MODAL */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-brand-ivory rounded-lg border border-brand-warmgray max-w-md w-full p-6 shadow-lg space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-brand-warmgray">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Log Attendance Record</h3>
              <button onClick={() => setShowMarkModal(false)} className="text-brand-muted hover:text-brand-navy">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleMarkAttendanceSubmit} className="space-y-4">
              {/* Employee Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Select Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LEAVE">ON LEAVE</option>
                  <option value="HALF_DAY">HALF DAY</option>
                </select>
              </div>

              {form.status !== 'ABSENT' && form.status !== 'LEAVE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Check-In</label>
                    <input
                      type="text"
                      placeholder="09:00"
                      value={form.checkInTime}
                      onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Check-Out</label>
                    <input
                      type="text"
                      placeholder="18:00"
                      value={form.checkOutTime}
                      onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-warmgray mt-4">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 border border-brand-warmgray text-brand-navy bg-brand-ivory text-xs font-bold rounded-lg hover:bg-[#F2EDE1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-navy hover:bg-[#1F2E52] text-white text-xs font-bold rounded-lg"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
