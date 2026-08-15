import React, { useState, useEffect } from 'react';
import api from '../services/api';
import JobPercentageChart from '../components/JobPercentageChart';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/admin');
        setStats(res.data);
      } catch (e) {
        setError('Failed to fetch financial report parameters.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const res = await api.get(`/payroll/query?month=${month}&year=${year}`);
      const payrolls = res.data;

      if (!payrolls || payrolls.length === 0) {
        alert(`No payroll data found for ${month}/${year}. Please run payroll for this month first.`);
        setLoading(false);
        return;
      }

      // Group by department
      const grouped = payrolls.reduce((acc, p) => {
        const dept = p.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        
        acc[dept].push({
          'Employee Code': p.employeeCode,
          'Name': p.employeeName,
          'Designation': p.designation,
          'Month/Year': `${p.month}/${p.year}`,
          'Days (Present/Leave/Absent)': `${p.presentDays}/${p.leaveDays}/${p.absentDays}`,
          'Basic Salary': p.basicSalary,
          'HRA': p.hra,
          'DA': p.da,
          'Conveyance': p.conveyance,
          'Medical': p.medical,
          'Other Allowances': p.otherAllowances,
          'Gross Salary': p.grossSalary,
          'PF': p.pf,
          'Prof. Tax': p.professionalTax,
          'Income Tax': p.incomeTax,
          'Loan EMI': p.loanEmi,
          'Other Deductions': p.otherDeductions,
          'Total Deductions': p.totalDeductions,
          'Net Salary': p.netSalary,
          'Status': p.status
        });
        return acc;
      }, {});

      const wb = XLSX.utils.book_new();
      
      // Create a sheet for each department
      Object.keys(grouped).forEach(dept => {
        const ws = XLSX.utils.json_to_sheet(grouped[dept]);
        const safeSheetName = dept.substring(0, 31).replace(/[\\/?*[\]]/g, '');
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
      });

      XLSX.writeFile(wb, `Department_Payslips_${month}_${year}.xlsx`);
    } catch (e) {
      console.error(e);
      setError('Failed to download report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Financial Reports</h1>
          <p className="text-xs text-brand-muted font-medium">Department expenditures and payroll costs trend charts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 border border-brand-warmgray text-brand-navy bg-brand-ivory hover:bg-[#F2EDE1] font-bold text-xs rounded-xl transition-all"
          >
            Download Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-brand-warmgray text-brand-navy bg-brand-ivory hover:bg-[#F2EDE1] font-bold text-xs rounded-xl transition-all"
          >
            Print Reports Page
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-brand-ivory border border-brand-warmgray rounded-xl p-6 min-h-[500px]">
            <JobPercentageChart distribution={stats.departmentCostDistribution} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-brand-muted">
          No metrics available to compile charts.
        </div>
      )}
    </div>
  );
};

export default Reports;
