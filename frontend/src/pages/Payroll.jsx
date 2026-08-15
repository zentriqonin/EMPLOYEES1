import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Payroll = () => {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/payroll/query?month=${month}&year=${year}`);
      setPayrollRuns(res.data);
    } catch (e) {
      setError('Failed to fetch payroll historical records for the selected month/year.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleRunPayroll = async () => {
    setError('');
    setSuccess('');
    setRunning(true);
    try {
      await api.post('/payroll/run-all', {
        month: parseInt(month),
        year: parseInt(year),
      });
      setSuccess('Payroll runs calculated successfully for all active employees!');
      fetchPayrolls();
    } catch (err) {
      setError('Error occurred during payroll calculations run.');
    } finally {
      setRunning(false);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    setError('');
    setSuccess('');
    setPayingId(payrollId);
    try {
      await api.post(`/payroll/pay/${payrollId}`);
      setSuccess('Salary marked as PAID. Payslip PDF has been generated and stored!');
      fetchPayrolls();
    } catch (err) {
      setError('Failed to execute payment status change.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Payroll Processing Engine</h1>
        <p className="text-xs text-brand-muted font-medium">Calculate salaries, apply attendance proration, and dispatch payslips</p>
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

      {/* Control Panel */}
      <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray mb-6 flex flex-col md:flex-row gap-5 items-end justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:max-w-3xl">
          {/* Month */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Payroll Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Payroll Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Search</label>
            <div className="relative h-full flex items-end">
              <svg className="w-4 h-4 text-brand-muted absolute left-3 bottom-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2.5 bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs font-medium rounded-lg outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold w-full"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleRunPayroll}
          disabled={running}
          className="px-5 py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          {running ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Calculate Monthly Payroll'
          )}
        </button>
      </div>

      {/* Payroll Results List */}
      <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {(() => {
              const filteredPayrollRuns = payrollRuns.filter(p => p.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()));
              return (
                <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                  <th className="px-4 py-3">Employee Name & Code</th>
                  <th className="px-4 py-3">Days (Pres/Leave/Absent)</th>
                  <th className="px-4 py-3">Gross Pay</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Net salary</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                {filteredPayrollRuns.map((p) => (
                  <tr key={p.id} className="bg-brand-ivory transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-bold text-brand-navy">{p.employeeName}</p>
                      <p className="text-[11px] text-brand-muted">{p.employeeCode}</p>
                    </td>
                    <td className="px-4 py-4 text-brand-navy/80 font-normal">
                      {p.presentDays} / {p.leaveDays} / {p.absentDays} (of {p.totalDays}d)
                    </td>
                    <td className="px-4 py-4 text-brand-navy font-normal">Rs. {p.grossSalary.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#B3543A] font-normal">Rs. {p.totalDeductions.toLocaleString()}</td>
                    <td className="px-4 py-4 text-[#3F7A4F] font-bold text-[13px]">Rs. {p.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${
                        p.status === 'PAID' ? 'bg-[#E3EFE5] text-[#3F7A4F]' : 'bg-[#F0EEE6] text-[#8A8676]'
                      }`}>
                        {p.status === 'PAID' ? 'Paid' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        {p.status === 'DRAFT' ? (
                          <button
                            onClick={() => handleMarkAsPaid(p.id)}
                            disabled={payingId === p.id}
                            className="px-3.5 py-1.5 bg-[#3F7A4F] hover:opacity-90 text-white font-medium text-xs rounded-lg transition-colors"
                          >
                            {payingId === p.id ? (
                              <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin block"></span>
                            ) : (
                              'Disburse & Pay'
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-brand-muted font-medium italic">Paid & Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayrollRuns.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      {searchTerm ? 'No payroll records found for the searched employee ID.' : 'No payroll records processed for the selected period. Run payroll to calculate.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
