import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import SalaryStructures from './pages/SalaryStructures';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Payroll from './pages/Payroll';
import Payslips from './pages/Payslips';
import Reports from './pages/Reports';
import Notices from './pages/Notices';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// 1. Protected Route: Authenticated users only
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. Role Protected Route: Admin / HR only
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 3. Layout Wrapper for authenticated dashboard views
const MainLayout = () => {
  const { user, logout, isAdmin, isHR } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-zen-bg text-zen-text font-sans animate-in fade-in duration-500">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar - Desktop Only */}
        <div className="hidden lg:block">
          <Navbar />
        </div>

        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-sm shrink-0 relative">
          <div className="flex items-center gap-2">
            <img
              src="/zenlogo-removebg.png"
              alt="Zen Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-base font-bold text-[#1E3A8A] tracking-wide">
              Payroll Hub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center font-bold text-xs text-white uppercase select-none focus:outline-none transition-colors"
            >
              {user?.username?.substring(0, 2)}
            </button>
          </div>

          {/* Profile Dropdown for Logout */}
          {showMenu && (
            <div className="absolute right-6 top-14 bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="px-4 py-2 border-b border-[#F3F4F6]">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                <p className="text-sm font-bold text-[#1E3A8A] truncate mt-0.5">{user?.username}</p>
                <p className="text-xs text-slate-500 font-semibold">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Admin / HR restricted routes */}
            <Route path="employees" element={
              <RoleRoute allowedRoles={['ADMIN', 'HR']}>
                <Employees />
              </RoleRoute>
            } />
            <Route path="salaries" element={
              <RoleRoute allowedRoles={['ADMIN', 'HR']}>
                <SalaryStructures />
              </RoleRoute>
            } />
            <Route path="payroll" element={
              <RoleRoute allowedRoles={['ADMIN', 'HR']}>
                <Payroll />
              </RoleRoute>
            } />
            <Route path="reports" element={
              <RoleRoute allowedRoles={['ADMIN', 'HR']}>
                <Reports />
              </RoleRoute>
            } />

            {/* Common / Self-Service routes */}
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="payslips" element={<Payslips />} />
            <Route path="notices" element={<Notices />} />
            
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs uppercase tracking-wider">Home</span>
          </NavLink>

          <NavLink 
            to="/notices" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
              }`
            }
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 15H4" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <span className="text-xs uppercase tracking-wider">Inbox</span>
          </NavLink>

          <NavLink 
            to="/payslips" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs uppercase tracking-wider">Me</span>
          </NavLink>

          <NavLink 
            to={(isAdmin && isAdmin()) || (isHR && isHR()) ? "/employees" : "/attendance"} 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 h-full gap-1 transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs uppercase tracking-wider">
              {(isAdmin && isAdmin()) || (isHR && isHR()) ? "My Team" : "My Time"}
            </span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
