// client/src/components/CostChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import '../styles/CostChart.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const CostChart = ({ comparisons }) => {
  if (!comparisons || comparisons.length === 0) return null;

  const chartData = comparisons.map(({ loan, summary }) => ({
    name: loan.bank_name,
    'Total Cost': summary.totalCost,
  }));

  return (
    <div className="cost-chart-card">
      <div className="cost-chart-header">
        <h3 className="cost-chart-title">Total Cost Comparison</h3>
          <p className="cost-chart-subtitle">
          Estimated total payable at the lowest published rate; fees and lender-specific charges are excluded
        </p>
      </div>

      <div className="cost-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `₹${v / 1000}k`}
              tick={{ fill: '#475569', fontSize: 12 }}
            />
            <Tooltip
              formatter={(val) => [formatCurrency(val), 'Total Cost']}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="Total Cost" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;
