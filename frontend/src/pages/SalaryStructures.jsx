import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SalaryStructures = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    basicSalary: 0,
    hra: 0,
    da: 0,
    conveyance: 0,
    medical: 0,
    otherAllowances: 0,
    pf: 0,
    professionalTax: 0,
    incomeTax: 0,
    loanEmi: 0,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(res.data);
        if (res.data.length > 0) {
          setSelectedEmpId(res.data[0].id);
        }
      } catch (e) {
        setError('Failed to fetch employee list.');
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;

    const fetchSalaryStructure = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        const res = await api.get(`/salaries/employee/${selectedEmpId}`);
        setForm({
          basicSalary: res.data.basicSalary || 0,
          hra: res.data.hra || 0,
          da: res.data.da || 0,
          conveyance: res.data.conveyance || 0,
          medical: res.data.medical || 0,
          otherAllowances: res.data.otherAllowances || 0,
          pf: res.data.pf || 0,
          professionalTax: res.data.professionalTax || 0,
          incomeTax: res.data.incomeTax || 0,
          loanEmi: res.data.loanEmi || 0,
        });
      } catch (e) {
        setError('Failed to load salary structure details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryStructure();
  }, [selectedEmpId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.post('/salaries', {
        employeeId: selectedEmpId,
        ...form,
      });
      setSuccess('Salary structure updated successfully!');
    } catch (err) {
      setError('Failed to save salary structure.');
    } finally {
      setSaving(false);
    }
  };

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
      setSuccess(`Employee ${found.firstName} ${found.lastName} selected.`);
    } else {
      setError('Employee not found with that ID or Code.');
      setSuccess('');
    }
  };

  const handleInputChange = (field, val) => {
    const numericVal = parseFloat(val) || 0;
    setForm({
      ...form,
      [field]: numericVal,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight">Salary Configuration</h1>
        <p className="text-xs text-brand-muted font-medium">Configure allowances, basic salary, and static deductions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left selector panel */}
        <div className="lg:col-span-1 bg-brand-ivory rounded-xl p-5 border border-brand-warmgray flex flex-col gap-5">
          <div className="flex flex-col gap-2">
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
          </div>

          <div className="relative">
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

        {/* Right editor panel */}
        <div className="lg:col-span-3 bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden p-6">
          <div className="border-b border-brand-warmgray pb-4 mb-6">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Configure Salary Parameters</h3>
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

          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Earnings Block */}
              <div>
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wide mb-3">Earnings & Allowances</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Basic Salary</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.basicSalary === 0 ? '' : form.basicSalary}
                      onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">HRA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.hra === 0 ? '' : form.hra}
                      onChange={(e) => handleInputChange('hra', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">DA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.da === 0 ? '' : form.da}
                      onChange={(e) => handleInputChange('da', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Conveyance Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.conveyance === 0 ? '' : form.conveyance}
                      onChange={(e) => handleInputChange('conveyance', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Medical Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.medical === 0 ? '' : form.medical}
                      onChange={(e) => handleInputChange('medical', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Other Allowances</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.otherAllowances === 0 ? '' : form.otherAllowances}
                      onChange={(e) => handleInputChange('otherAllowances', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-brand-warmgray" />

              {/* Deductions Block */}
              <div>
                <h4 className="text-xs font-bold text-[#B3543A] uppercase tracking-wide mb-3">Deductions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Provident Fund (PF)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.pf === 0 ? '' : form.pf}
                      onChange={(e) => handleInputChange('pf', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Professional Tax</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.professionalTax === 0 ? '' : form.professionalTax}
                      onChange={(e) => handleInputChange('professionalTax', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Income Tax (TDS)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.incomeTax === 0 ? '' : form.incomeTax}
                      onChange={(e) => handleInputChange('incomeTax', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Loan EMI</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.loanEmi === 0 ? '' : form.loanEmi}
                      onChange={(e) => handleInputChange('loanEmi', e.target.value)}
                      className="bg-brand-ivory border border-brand-warmgray text-brand-navy text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Total Calculation Output */}
              <div className="bg-[#F2EDE1] rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs border border-brand-warmgray">
                <div>
                  <p className="font-bold text-brand-navy">Calculated Summary Rates</p>
                  <p className="text-brand-muted font-medium mt-1">Based on full attendance months (before taxes/deductions)</p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <span className="text-[11px] text-brand-muted font-bold uppercase block">Gross Salary</span>
                    <span className="text-sm font-black text-brand-navy">
                      Rs. {(form.basicSalary + form.hra + form.da + form.conveyance + form.medical + form.otherAllowances).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-brand-muted font-bold uppercase block">Deductions</span>
                    <span className="text-sm font-black text-[#B3543A]">
                      Rs. {(form.pf + form.professionalTax + form.incomeTax + form.loanEmi).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-brand-muted font-bold uppercase block">Estimated Net Pay</span>
                    <span className="text-sm font-black text-[#3F7A4F]">
                      Rs. {Math.max(0, (form.basicSalary + form.hra + form.da + form.conveyance + form.medical + form.otherAllowances) - (form.pf + form.professionalTax + form.incomeTax + form.loanEmi)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-brand-warmgray">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-navy hover:bg-[#1F2E52] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Save Configurations'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryStructures;
