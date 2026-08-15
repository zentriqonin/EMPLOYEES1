import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const JobPercentageChart = ({ distribution }) => {
  const data = Object.entries(distribution || {}).map(([key, val]) => ({
    name: key,
    value: parseFloat(val.toString()),
  }));

  const COLORS = ['#14213D', '#C9A15A', '#3A5A8C', '#8A8676', '#E5E0D5', '#9AA5BD'];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="bg-brand-ivory rounded-xl p-5 border border-brand-warmgray flex flex-col h-full transition-colors">
      <h3 className="text-brand-navy font-bold text-sm uppercase tracking-wide mb-4">Department Cost Allocation</h3>
      <div className="flex-1 h-full min-h-[300px] flex flex-col items-center justify-center relative">
        {data.length === 0 ? (
          <div className="text-brand-muted text-xs">No payroll distributions mapped</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={160}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `Rs. ${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#14213D', border: 'none', borderRadius: '8px', color: '#FBF8F2', fontSize: '11px' }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Percentage Tag */}
            <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xs text-brand-muted font-medium block">Total Cost</span>
              <span className="text-3xl font-black text-brand-navy block">
                Rs. {total > 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobPercentageChart;
