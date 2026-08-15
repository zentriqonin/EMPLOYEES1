import React from 'react';

const ScheduleSection = ({ attendance, leaves }) => {
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Calculate padding for India calendar (Week starts on Monday)
  // getDay() returns 0 for Sunday, 1 for Monday... 6 for Saturday
  const startDay = new Date(year, today.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Tuesday is 1, ..., Sunday is 6
  const offset = (startDay + 6) % 7;
  const paddingArray = Array.from({ length: offset }, (_, i) => i);

  // Check if a day was marked as Leave or Present based on passed logs
  const getDayStatus = (day) => {
    const checkDateStr = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = attendance?.find(a => a.date === checkDateStr);
    return log?.status || null; // e.g. PRESENT, LEAVE, ABSENT
  };

  return (
    <div className="bg-brand-ivory rounded-xl p-4 border border-brand-warmgray flex flex-col gap-4 h-full transition-shadow duration-300">
      {/* Calendar Block */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-brand-navy text-sm">{monthName} {year}</h3>
          <span className="text-xs text-brand-gold font-semibold cursor-pointer">View Details</span>
        </div>

        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-brand-muted mb-2">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-brand-navy">
          {/* Pad offset for correct start day */}
          {paddingArray.map((_, idx) => (
            <span key={`pad-${idx}`} className="py-1"></span>
          ))}
          {daysArray.map((day) => {
            const status = getDayStatus(day);
            const isToday = day === today.getDate();
            return (
              <span
                key={day}
                className={`py-1 rounded-full flex flex-col items-center justify-center relative cursor-pointer ${isToday ? 'bg-brand-navy text-brand-gold font-bold' : 'hover:bg-brand-warmgray'
                  }`}
              >
                {day}
                {/* Visual Status Indicator dots */}
                {status === 'LEAVE' && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-orange-400 rounded-full"></span>
                )}
                {status === 'PRESENT' && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
                {status === 'ABSENT' && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-red-500 rounded-full"></span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      <hr className="border-brand-warmgray" />

      {/* Schedule / Leaves Activity Block */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-brand-navy text-sm">Leave Calendar</h3>
          <span className="text-xs text-brand-muted">Total Approved</span>
        </div>

        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {leaves && leaves.length > 0 ? (
            leaves.map((l) => (
              <div key={l.id} className="p-3 bg-transparent border border-brand-warmgray rounded-lg flex flex-col gap-1 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-brand-navy uppercase tracking-wide">
                    {l.leaveTypeName}
                  </span>
                  <span className={`text-xs px-2 py-0.5 font-bold rounded-full ${l.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {l.status}
                  </span>
                </div>
                <p className="text-xs text-brand-navy/70 truncate mt-1">Reason: {l.reason}</p>
                <span className="text-xs text-brand-muted font-semibold mt-1">
                  Dates: {l.startDate} to {l.endDate}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-brand-muted text-xs font-medium">
              No leave records configured for this month.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
