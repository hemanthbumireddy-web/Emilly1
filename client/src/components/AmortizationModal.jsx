// client/src/components/AmortizationModal.jsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateSchedule } from '../utils/loanCalculator.js';
import { PrepaymentSimulator } from './PrepaymentSimulator.jsx';
import '../styles/AmortizationModal.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const PIE_COLORS = ['#3b82f6', '#f59e0b'];

export const AmortizationModal = ({
  isOpen,
  onClose,
  loan,
  amount,
  tenureMonths,
}) => {
  if (!isOpen || !loan) return null;

  const schedule = generateSchedule(amount, loan.interest_rate, tenureMonths);

  const totalPrincipal = Number(amount);
  const totalInterest = schedule.reduce((sum, item) => sum + item.interestPaid, 0);

  const pieData = [
    { name: 'Principal Amount', value: Math.round(totalPrincipal) },
    { name: 'Total Interest', value: Math.round(totalInterest) },
  ];

  return (
    <div className="amort-overlay" onClick={onClose}>
      <div className="amort-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="amort-header">
          <div>
            <h3 className="amort-header-title">
              Amortization Schedule — {loan.bank_name}
            </h3>
            <p className="amort-header-subtitle">
              ₹{totalPrincipal.toLocaleString('en-IN')} at the advertised minimum rate of {Number(loan.interest_rate).toFixed(2)}% for {tenureMonths} months. Fees excluded; actual rate may differ.
            </p>
          </div>
          <button
            type="button"
            className="amort-btn-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="amort-body">
          {/* Recharts Pie Chart: Total Principal vs Total Interest */}
          <div className="amort-chart-section">
            <h4 className="amort-chart-title">Payment Breakdown</h4>
            <div className="amort-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prepayment Simulator */}
          <PrepaymentSimulator
            principal={amount}
            annualRate={loan.interest_rate}
            tenureMonths={tenureMonths}
          />

          {/* Month-by-month Schedule Table */}
          <div className="amort-table-wrapper">
            <table className="amort-schedule-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>EMI</th>
                  <th>Principal Paid</th>
                  <th>Interest Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{formatCurrency(row.emi)}</td>
                    <td>{formatCurrency(row.principalPaid)}</td>
                    <td>{formatCurrency(row.interestPaid)}</td>
                    <td>{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="amort-footer">
          <button
            type="button"
            className="btn-amort-dismiss"
            onClick={onClose}
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmortizationModal;
