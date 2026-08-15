import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useCountUp = (endValue, duration = 1000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * endValue));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  return count;
};

const CountUpNumber = ({ value, prefix = '', suffix = '' }) => {
  const count = useCountUp(Number(value) || 0);
  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const DashboardStats = ({ stats, role }) => {
  const isEmployee = role === 'EMPLOYEE';
  const navigate = useNavigate();

  const cardBaseClass = "bg-brand-ivory text-brand-navy rounded-xl px-5 py-4 border border-brand-warmgray flex flex-col justify-between relative overflow-hidden group transition-colors duration-300";
  const labelClass = "text-brand-muted text-[10px] font-bold uppercase tracking-widest mb-1";
  const valueClass = "text-2xl font-black tracking-tight text-brand-navy";
  const iconBaseClass = "absolute right-3 top-3 w-8 h-8 opacity-10 text-brand-gold group-hover:opacity-20 transition-opacity duration-300";

  if (isEmployee) {
    const totalLeaves = stats.leaveBalances?.reduce((sum, b) => sum + b.balance, 0) || 0;
    
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Salary */}
        <div className={cardBaseClass}>
          <div>
            <h4 className={labelClass}>Latest Net Pay</h4>
            <p className={`${valueClass}`}>
              <CountUpNumber value={stats.latestPayslipNetPay} prefix="₹" />
            </p>
          </div>
          <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
        </div>

        {/* Payday */}
        <div className={cardBaseClass}>
          <div>
            <h4 className={labelClass}>Next Payday</h4>
            <p className={`${valueClass}`}>
              1st
            </p>
          </div>
          <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
        </div>

        {/* Leave Balance */}
        <div className={cardBaseClass}>
          <div>
            <h4 className={labelClass}>Leave Balance</h4>
            <p className={`${valueClass}`}>
              <CountUpNumber value={totalLeaves} /> <span className="text-sm font-bold text-brand-navy">Days</span>
            </p>
          </div>
          <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22l-9-12z"/></svg>
        </div>

        {/* Present Days */}
        <div className={cardBaseClass}>
          <div>
            <h4 className={labelClass}>Attendance</h4>
            <p className={`${valueClass}`}>
              <CountUpNumber value={stats.presentDaysCurrentMonth} /> <span className="text-sm font-bold text-brand-navy">Days</span>
            </p>
          </div>
          <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
        </div>
      </div>
    );
  }

  // Admin / HR Layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Employees */}
      <div className={cardBaseClass}>
        <div>
          <h4 className={labelClass}>Total Staff</h4>
          <p className={`${valueClass}`}>
            <CountUpNumber value={stats.employeeCount} />
          </p>
        </div>
        <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      </div>

      {/* Monthly Payroll Cost */}
      <div className={cardBaseClass}>
        <div>
          <h4 className={labelClass}>Monthly Payroll</h4>
          <p className={`${valueClass}`}>
            <CountUpNumber value={stats.monthlyPayrollCost} prefix="₹" />
          </p>
        </div>
        <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
      </div>

      {/* Pending Leave Requests */}
      <div 
        onClick={() => navigate('/leaves')}
        className={`${cardBaseClass} cursor-pointer hover:border-brand-gold`}
      >
        <div>
          <h4 className={labelClass}>Pending Leaves</h4>
          <p className={`${valueClass}`}>
            <CountUpNumber value={stats.pendingLeaveRequestsCount} />
          </p>
        </div>
        <svg className={`${iconBaseClass}`} fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
      </div>
    </div>
  );
};

export default DashboardStats;
