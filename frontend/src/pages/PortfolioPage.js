import React from 'react';
import CrudPage from './CrudPage';
import { portfolio } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const gainColor = (v) => Number(v) >= 0 ? '#10b981' : '#ef4444';

const columns = [
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'symbol', label: 'Symbol', render: (v) => <span className="badge badge-primary">{v}</span> },
  { key: 'amount', label: 'Amount', render: (v) => Number(v).toFixed(4) },
  { key: 'avgBuyPrice', label: 'Avg Buy Price', render: (v) => fmt(v) },
  { key: 'currentPrice', label: 'Current Price', render: (v) => fmt(v) },
  { key: 'unrealizedGain', label: 'Unrealized P/L', render: (v) => <span style={{ color: gainColor(v), fontWeight: 700 }}>{fmt(v)}</span> },
];

const detailFields = [
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'amount', label: 'Amount' },
  { key: 'avgBuyPrice', label: 'Avg Buy Price', render: (v) => fmt(v) },
  { key: 'currentPrice', label: 'Current Price', render: (v) => fmt(v) },
  { key: 'totalInvested', label: 'Total Invested', render: (v) => fmt(v) },
  { key: 'unrealizedGain', label: 'Unrealized Gain/Loss', render: (v) => <span style={{ color: gainColor(v), fontWeight: 700 }}>{fmt(v)}</span> },
  { key: 'exchange', label: 'Exchange' },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text' },
  { key: 'symbol', label: 'Symbol', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'avgBuyPrice', label: 'Avg Buy Price', type: 'number' },
  { key: 'currentPrice', label: 'Current Price', type: 'number' },
  { key: 'totalInvested', label: 'Total Invested', type: 'number' },
  { key: 'unrealizedGain', label: 'Unrealized Gain', type: 'number' },
  { key: 'exchange', label: 'Exchange', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function PortfolioPage() {
  return (
    <CrudPage
      title="Portfolio"
      subtitle="AI-powered portfolio tracking and tax-optimized analysis"
      api={portfolio}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Portfolio Analysis"
      aiAction={() => portfolio.aiAnalyze()}
    />
  );
}
