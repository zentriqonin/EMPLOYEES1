import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-navy-900 text-white flex items-center justify-between px-8 border-b border-navy-800 shadow-md shrink-0">
      {/* Search Input */}
      <div className="flex items-center bg-navy-850 border border-navy-750 rounded-lg px-3.5 py-1.5 w-80 shadow-inner">
        <svg className="w-4 h-4 text-slate-400 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-sm placeholder-slate-400 w-full text-white"
        />
      </div>

      {/* Action Tray & User Display */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button 
          onClick={() => navigate('/notices')}
          className="relative p-1 text-slate-300 hover:text-white transition-transform duration-300 hover:rotate-12 hover:scale-110 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-navy-900 animate-pulse"></span>
        </button>

        {/* User Greeting Profile */}
        <div className="relative group flex items-center gap-3 border-l border-navy-800 pl-6 cursor-pointer py-2">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium leading-none">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200 mt-1">
              Hi, {user?.username}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-blue-500 bg-navy-800 flex items-center justify-center font-bold text-white shadow-inner uppercase">
            {user?.username?.substring(0, 2)}
          </div>

          {/* Hover Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-brand-ivory rounded-xl shadow-lg border border-brand-warmgray opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
            <div className="px-4 py-3 border-b border-brand-warmgray bg-[#F2EDE1]">
              <p className="text-sm font-bold text-brand-navy truncate">{user?.username}</p>
              <p className="text-xs text-brand-muted font-bold mt-0.5 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#B3543A] rounded-lg hover:bg-[#F5E3DD] transition-colors text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
