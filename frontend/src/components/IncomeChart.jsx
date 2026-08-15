import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const IncomeChart = ({ data }) => {
  // Color sequence for bars matching the user's reference dashboard image
  const colors = ['#14213D', '#C9A15A', '#3A5A8C', '#8A8676', '#E5E0D5', '#9AA5BD'];

  const chartData = data?.map((t, idx) => ({
    name: t.monthName,
    cost: t.cost,
  })) || [];

  return (
    <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray flex flex-col h-full">
      <h3 className="text-brand-navy font-bold text-sm uppercase tracking-wide mb-4">Payroll Trend History</h3>
      <div className="flex-1 h-64">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No historical trend records found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IncomeChart;
