import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import zenLogo from '../assets/zenlogo.jpeg';

const Sidebar = () => {
  const { user, logout, isAdmin, isHR } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center px-6 py-3.5 text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-white/5 text-brand-gold border-l-4 border-brand-gold'
        : 'text-brand-grayblue hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="w-60 bg-brand-navy text-white flex flex-col h-screen shrink-0 border-r border-brand-warmgray">
      {/* Brand Title */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <img
          src={zenLogo}
          alt="Zen Logo"
          className="h-10 w-auto object-contain rounded-md"
        />
        <span className="text-xl font-bold text-brand-gold">
          Payroll Hub
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        <NavLink to="/dashboard" className={navItemClass}>
          <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink to="/notices" className={navItemClass}>
          <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Notice Board
        </NavLink>

        {(isAdmin() || isHR()) && (
          <>
            <NavLink to="/employees" className={navItemClass}>
              <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Employees
            </NavLink>

            <NavLink to="/salaries" className={navItemClass}>
              <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salary Structure
            </NavLink>
          </>
        )}

        <NavLink to="/attendance" className={navItemClass}>
          <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Attendance
        </NavLink>

        <NavLink to="/leaves" className={navItemClass}>
          <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Leave Management
        </NavLink>

        {(isAdmin() || isHR()) && (
          <NavLink to="/payroll" className={navItemClass}>
            <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Payroll Engine
          </NavLink>
        )}

        <NavLink to="/payslips" className={navItemClass}>
          <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Payslips
        </NavLink>

        {(isAdmin() || isHR()) && (
          <NavLink to="/reports" className={navItemClass}>
            <svg className="w-5 h-5 mr-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Reports
          </NavLink>
        )}
      </div>

      {/* Footer Profile Info & Logout */}
      <div className="p-4 border-t border-white/10 bg-brand-navy flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm uppercase">
            {user?.username?.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate leading-tight">{user?.username}</p>
            <p className="text-xs text-brand-grayblue">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-white/20 hover:border-red-500 hover:text-red-400 text-xs font-semibold rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
