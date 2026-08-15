import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Payslips = () => {
  const { user, isEmployee } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isEmployee()) {
      const loadProfileAndPayslips = async () => {
        try {
          setLoading(true);
          const empRes = await api.get('/employees/me');
          setSelectedEmpId(empRes.data.id);
          const payslipsRes = await api.get(`/payslips/employee/${empRes.data.id}`);
          setPayslips(payslipsRes.data);
        } catch (e) {
          setError('Failed to fetch your payslips.');
        } finally {
          setLoading(false);
        }
      };
      loadProfileAndPayslips();
    } else {
      const loadEmployees = async () => {
        try {
          const res = await api.get('/employees');
          setEmployees(res.data);
          if (res.data.length > 0) {
            setSelectedEmpId(res.data[0].id);
          }
        } catch (e) {
          setError('Failed to load employee directory.');
        }
      };
      loadEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (isEmployee() || !selectedEmpId) return;

    const fetchPayslips = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/payslips/employee/${selectedEmpId}`);
        setPayslips(res.data);
      } catch (e) {
        setError('Failed to fetch employee payslips.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, [selectedEmpId]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toLowerCase();
    const found = employees.find(
      emp => 
        (emp.employeeCode && emp.employeeCode.toLowerCase() === query) || 
        (emp.id && emp.id.toString() === query)
    );
    if (found) {
      setSelectedEmpId(found.id);
      setError('');
    } else {
      setError('Employee not found. Please verify the ID.');
    }
  };

  const handleDownload = async (payrollId, payslipNum) => {
    try {
      const res = await api.get(`/payslips/download/${payrollId}`, {
        responseType: 'blob', // Critical for receiving raw binary PDF content
      });
      
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Payslip_${payslipNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (e) {
      alert('Failed to download payslip PDF.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Payslip Documents</h1>
        <p className="text-xs text-brand-muted font-medium">
          {isEmployee() ? 'Download and check your monthly pay summaries' : 'Search and download employee payslips'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Filter Panel for HR/Admin */}
        {!isEmployee() && (
          <div className="lg:col-span-1 bg-brand-ivory rounded-xl p-5 border border-brand-warmgray flex flex-col gap-3">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wide">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
            
            <div className="relative mt-2 mb-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-brand-warmgray"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-brand-ivory px-2 text-[10px] font-bold uppercase text-brand-muted">OR</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wide">Search by ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. EMP001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs font-medium rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white text-xs font-bold rounded-lg transition-all"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Side Payslip list */}
        <div className={`bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden p-6 ${
          isEmployee() ? 'lg:col-span-4' : 'lg:col-span-3'
        }`}>
          <div className="border-b border-brand-warmgray pb-4 mb-5">
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">Generated Payslips</h3>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                    <th className="px-4 py-3">Payslip Number</th>
                    <th className="px-4 py-3">Payroll Month / Year</th>
                    <th className="px-4 py-3">Date Generated</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-warmgray text-xs font-medium text-brand-navy">
                  {payslips.map((p) => {
                    const monthName = new Date(p.payroll.year, p.payroll.month - 1).toLocaleString('default', { month: 'long' });
                    return (
                      <tr key={p.id} className="bg-brand-ivory transition-colors">
                        <td className="px-4 py-3 text-brand-navy font-bold">{p.payslipNumber}</td>
                        <td className="px-4 py-3 text-brand-navy/80 font-normal">{monthName} {p.payroll.year}</td>
                        <td className="px-4 py-3 text-brand-muted font-normal">{p.generatedAt?.split('T')[0] || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDownload(p.payroll.id, p.payslipNumber)}
                              className="px-3 py-1.5 bg-brand-ivory hover:bg-[#F2EDE1] border border-brand-warmgray text-brand-navy font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {payslips.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400">
                        No payslips generated for this employee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payslips;
