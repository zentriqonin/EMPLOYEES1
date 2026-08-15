import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardStats from '../components/DashboardStats';
import JobPercentageChart from '../components/JobPercentageChart';
import ScheduleSection from '../components/ScheduleSection';

const useLiveTimer = (checkInTime, checkOutTime) => {
  const [duration, setDuration] = useState("0h 0m");

  useEffect(() => {
    if (!checkInTime) {
      setDuration("Not clocked in");
      return;
    }

    const calculate = () => {
      const [h1, m1] = checkInTime.split(':').map(Number);
      const now = new Date();
      const h2 = checkOutTime ? Number(checkOutTime.split(':')[0]) : now.getHours();
      const m2 = checkOutTime ? Number(checkOutTime.split(':')[1]) : now.getMinutes();

      const diffMin = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diffMin <= 0) {
        setDuration("0h 0m");
        return;
      }
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      setDuration(`${hours}h ${mins}m`);
    };

    calculate(); // initial run

    if (!checkOutTime) {
      const interval = setInterval(calculate, 60000); // update every minute
      return () => clearInterval(interval);
    }
  }, [checkInTime, checkOutTime]);

  return duration;
};

const Dashboard = () => {
  const { user, isEmployee } = useAuth();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Load notices for the dashboard feed
        const noticesRes = await api.get('/notices');
        const fetchedNotices = noticesRes.data;
        setNotices(fetchedNotices);

        if (fetchedNotices.length > 0 && !sessionStorage.getItem('noticeShown')) {
          setShowNoticeModal(true);
          sessionStorage.setItem('noticeShown', 'true');
        }
        if (isEmployee()) {
          const empProfileRes = await api.get('/employees/me');
          const empId = empProfileRes.data.id;

          const statsRes = await api.get(`/dashboard/employee/${empId}`);
          setStats(statsRes.data);

          // Get employee specific history for calendar
          const today = new Date();
          const startStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
          const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()}`;

          const attRes = await api.get(`/attendance/history/${empId}?start=${startStr}&end=${endStr}`);
          setAttendance(attRes.data);

          const leavesRes = await api.get(`/leaves/history/${empId}`);
          setLeaves(leavesRes.data);
        } else {
          // Admin / HR Data
          const statsRes = await api.get('/dashboard/admin');
          setStats(statsRes.data);

          // List employees for the status table
          const empRes = await api.get('/employees');
          setEmployees(empRes.data);

          // Load pending leaves for the schedule feed
          const pendingRes = await api.get('/leaves/pending');
          setLeaves(pendingRes.data);

          // Load current date attendance logs
          const todayStr = new Date().toISOString().split('T')[0];
          const attRes = await api.get(`/attendance/date/${todayStr}`);
          setAttendance(attRes.data);
        }
      } catch (err) {
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isEmployee]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAtt = isEmployee() ? attendance?.find(a => a.date === todayStr) : null;
  const liveDuration = useLiveTimer(todayAtt?.checkInTime, todayAtt?.checkOutTime);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-brand-ivory">
        <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-brand-ivory p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Dashboard Title Banner */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-navy tracking-tight">Payroll Hub</h1>
          <p className="text-xs text-brand-muted font-medium">Welcome back, {user?.username}</p>
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 bg-brand-ivory border border-brand-warmgray text-brand-navy rounded-lg">
          {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Row 1: DashboardStats */}
      <div className="mb-6">
        {stats && <DashboardStats stats={stats} role={user?.role} />}
      </div>

      {/* Admin/HR Gets a different layout for the rest, let's stick to employee for the wireframe primarily, but keep admin functioning */}
      {isEmployee() ? (
        <>
          {/* Row 2: Attendance & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Today's Attendance Box */}
            <div className="bg-brand-ivory rounded-xl border border-brand-warmgray p-6 flex flex-col transition-shadow">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6">
                Today's Attendance
              </h4>
              <div className="flex flex-col items-center justify-center flex-1 py-4">
                <span className="text-5xl font-black text-brand-navy tracking-tight mb-2">
                  {todayAtt?.checkInTime ? new Date(`1970-01-01T${todayAtt.checkInTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </span>
                <span className="text-sm font-bold text-brand-navy bg-brand-warmgray px-3 py-1 rounded-full mb-8">
                  Working {liveDuration}
                </span>

                {/* Clock In / Out Toggle Button */}
                {(!todayAtt || !todayAtt.checkInTime) ? (
                  <button
                    onClick={async () => {
                      try {
                        const empRes = await api.get('/employees/me');
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
                        await api.post('/attendance', {
                          employeeId: empRes.data.id,
                          date: now.toISOString().split('T')[0],
                          status: 'PRESENT',
                          checkInTime: timeStr
                        });
                        window.location.reload();
                      } catch (e) {
                        alert('Check-In failed: ' + e);
                      }
                    }}
                    className="w-full max-w-xs py-4 bg-brand-navy hover:bg-brand-navy/90 text-brand-gold font-bold text-sm rounded-xl transition-all active:scale-95"
                  >
                    Clock In
                  </button>
                ) : !todayAtt.checkOutTime ? (
                  <button
                    onClick={async () => {
                      try {
                        const empRes = await api.get('/employees/me');
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
                        await api.post('/attendance', {
                          employeeId: empRes.data.id,
                          date: now.toISOString().split('T')[0],
                          status: 'PRESENT',
                          checkOutTime: timeStr
                        });
                        window.location.reload();
                      } catch (e) {
                        alert('Check-Out failed: ' + e);
                      }
                    }}
                    className="w-full max-w-xs py-4 bg-brand-ivory border border-brand-navy hover:bg-brand-warmgray text-brand-navy font-bold text-sm rounded-xl transition-all active:scale-95"
                  >
                    Clock Out
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full max-w-xs py-4 bg-brand-warmgray text-brand-muted font-bold text-sm rounded-xl cursor-not-allowed"
                  >
                    Shift Completed
                  </button>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="h-full">
              <ScheduleSection attendance={attendance} leaves={leaves} />
            </div>
          </div>

          {/* Row 3: Salary Overview & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Salary Overview Card */}
            <div className="bg-brand-ivory rounded-xl border border-brand-warmgray p-6 transition-shadow">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6">
                Salary Overview
              </h4>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-3xl font-black text-brand-navy">₹{(stats?.latestPayslipNetPay || 0).toLocaleString()}</p>
                  <p className="text-xs text-brand-muted font-medium mt-1">Latest Pay ({stats?.latestPayslipMonthYear || 'N/A'})</p>
                </div>
                <a href="/payslips" className="text-xs font-bold text-brand-gold hover:underline">
                  View Payslip &rarr;
                </a>
              </div>
              
              {/* Mini visual indicator / Chart placeholder */}
              <div className="h-16 w-full flex items-end gap-1 pt-4 opacity-70">
                {[40, 60, 45, 80, 50, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-brand-warmgray rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
                <div className="flex-1 bg-brand-navy rounded-t-sm relative group" style={{ height: '100%' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-ivory border border-brand-warmgray text-brand-navy font-bold text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Current</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-ivory rounded-xl border border-brand-warmgray p-6 transition-shadow">
              <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6">
                Quick Actions
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <a href="/leaves" className="flex flex-col items-center justify-center p-4 bg-transparent border border-brand-warmgray hover:bg-brand-navy rounded-xl group transition-colors active:scale-95 text-center">
                  <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-gold mb-3 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <span className="text-xs font-bold text-brand-navy group-hover:text-brand-gold">Apply Leave</span>
                </a>
                
                <a href="/payslips" className="flex flex-col items-center justify-center p-4 bg-transparent border border-brand-warmgray hover:bg-brand-navy rounded-xl group transition-colors active:scale-95 text-center">
                  <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-gold mb-3 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-brand-navy group-hover:text-brand-gold">View Payslip</span>
                </a>

                <a href="/attendance" className="flex flex-col items-center justify-center p-4 bg-transparent border border-brand-warmgray hover:bg-brand-navy rounded-xl group transition-colors active:scale-95 text-center">
                  <div className="w-10 h-10 bg-brand-ivory rounded-full flex items-center justify-center text-brand-gold mb-3 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <span className="text-xs font-bold text-brand-navy group-hover:text-brand-gold">Attendance</span>
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Percentage Chart */}
            <div className="bg-brand-ivory rounded-xl border border-brand-warmgray p-6 transition-shadow min-h-[500px]">
              <JobPercentageChart distribution={stats.departmentCostDistribution} />
            </div>

            {/* Employee Status Table (Admin/HR only) */}
            <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden flex flex-col transition-shadow">
              <div className="p-5 border-b border-brand-warmgray flex justify-between items-center bg-transparent">
                <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Employees status</h3>
                <span className="text-xs font-bold text-brand-gold cursor-pointer">View All ({employees.length})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-transparent text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-warmgray">
                      <th className="px-6 py-3.5">Employee Name</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                    {employees.slice(0, 4).map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-warmgray text-brand-gold flex items-center justify-center font-bold text-xs uppercase border border-brand-warmgray">
                            {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-brand-navy">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-brand-muted">{emp.employeeCode}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-brand-navy">
                          {emp.department}
                          <p className="text-[10px] text-brand-muted">{emp.designation}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
             <ScheduleSection attendance={attendance} leaves={leaves} />
          </div>
        </div>
      )}

      {/* Notice Board Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-ivory rounded-xl w-full max-w-lg border border-brand-warmgray overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-brand-warmgray flex justify-between items-center bg-brand-navy text-brand-gold">
              <h2 className="text-lg font-black tracking-tight">Notice Board</h2>
              <button onClick={() => setShowNoticeModal(false)} className="text-brand-gold hover:text-white transition-colors active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {notices.map((n) => (
                <div key={n.id} className="p-4 bg-transparent border border-brand-warmgray rounded-xl transition-shadow">
                  <h4 className="font-bold text-brand-navy text-sm mb-1">{n.createdByUsername}</h4>
                  <p className="text-xs text-brand-muted mb-2">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-brand-navy whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
