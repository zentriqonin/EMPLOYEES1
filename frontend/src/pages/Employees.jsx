import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    status: 'ACTIVE',
    username: '',
    password: '',
    role: 'EMPLOYEE',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (e) {
      setError('Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setForm({
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      joiningDate: '',
      status: 'ACTIVE',
      username: '',
      password: '',
      role: 'EMPLOYEE',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      status: emp.status,
      username: emp.username || '',
      password: '',
      role: emp.role || 'EMPLOYEE',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editId) {
        // Edit flow
        await api.put(`/employees/${editId}`, form);
        setSuccess('Employee updated successfully!');
      } else {
        // Create flow
        await api.post('/auth/register', form);
        setSuccess('Employee created successfully!');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error occurred while saving employee record.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee? This will also remove their associated user login and attendance history.')) {
      try {
        await api.delete(`/employees/${id}`);
        setSuccess('Employee deleted successfully.');
        fetchEmployees();
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  const filteredEmployees = employees.filter((emp) => 
    emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-brand-ivory p-6 lg:p-8">
      {/* Head Banner */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">Employee Directory</h1>
          <p className="text-xs text-brand-muted font-medium">Add, update, or remove workforce configurations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-xs font-medium rounded-xl shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-64 text-slate-700 placeholder-slate-400"
            />
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3.5 bg-green-100 border border-green-200 text-green-700 text-xs font-semibold rounded-xl">
          {success}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-brand-ivory rounded-xl border border-brand-warmgray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EDE1] text-[11px] font-medium text-brand-muted uppercase tracking-[0.04em] border-b border-brand-warmgray">
                <th className="px-4 py-3">Employee Name & Code</th>
                <th className="px-4 py-3">Contact Email</th>
                <th className="px-4 py-3">Department & Title</th>
                <th className="px-4 py-3">Join Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-warmgray">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="bg-brand-ivory transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center font-medium text-xs text-brand-gold uppercase">
                      {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium text-[13px] text-brand-navy">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-brand-muted font-normal">{emp.employeeCode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-steelblue text-[13px]">{emp.email}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy text-[13px]">{emp.designation}</p>
                    <p className="text-xs text-brand-muted font-normal">{emp.department}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-normal text-[13px]">{emp.joiningDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#EFE6CE] text-[#7A5E1F]">
                      {emp.status ? (emp.status.charAt(0).toUpperCase() + emp.status.slice(1).toLowerCase()) : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="px-2 py-1 text-brand-steelblue text-xs font-medium rounded hover:bg-[#F2EDE1] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="px-2 py-1 text-[#B3543A] text-xs font-medium rounded hover:bg-[#F2EDE1] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    {searchTerm ? 'No employees found matching that ID.' : 'No employees registered in the system database.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg border max-w-2xl w-full p-6 shadow-lg space-y-6">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg font-black text-slate-800">
                {editId ? 'Modify Employee Profile' : 'Register New Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Code */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Code</label>
                <input
                  type="text"
                  required
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* First Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Joining Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</label>
                <input
                  type="date"
                  required
                  value={form.joiningDate}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                <input
                  type="text"
                  required
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</label>
                <input
                  type="text"
                  required
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Username (Only on Creation) */}
              {!editId && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Username</label>
                    <input
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Access Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="bg-slate-50 border text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="HR">HR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </>
              )}

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
