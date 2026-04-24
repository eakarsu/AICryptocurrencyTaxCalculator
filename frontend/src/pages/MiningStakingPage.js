import React from 'react';
import CrudPage from './CrudPage';
import { miningStaking } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const typeBadge = (t) => {
  const m = { mining: 'badge-warning', staking: 'badge-success', liquidity_providing: 'badge-info', yield_farming: 'badge-primary' };
  return <span className={`badge ${m[t] || 'badge-primary'}`}>{t?.replace('_', ' ')}</span>;
};
const statusBadge = (s) => {
  const m = { active: 'badge-success', completed: 'badge-primary', pending: 'badge-warning' };
  return <span className={`badge ${m[s] || 'badge-primary'}`}>{s}</span>;
};

const columns = [
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'cryptocurrency', label: 'Crypto' },
  { key: 'amount', label: 'Amount', render: (v) => Number(v).toFixed(4) },
  { key: 'valueAtReceipt', label: 'Value at Receipt', render: (v) => fmt(v) },
  { key: 'apy', label: 'APY', render: (v) => v ? `${v}%` : '-' },
  { key: 'platform', label: 'Platform' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'amount', label: 'Amount' },
  { key: 'valueAtReceipt', label: 'Value at Receipt', render: (v) => fmt(v) },
  { key: 'currentValue', label: 'Current Value', render: (v) => fmt(v) },
  { key: 'platform', label: 'Platform' },
  { key: 'pool', label: 'Pool' },
  { key: 'apy', label: 'APY', render: (v) => v ? `${v}%` : 'N/A' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'type', label: 'Type', type: 'select', options: ['mining', 'staking', 'liquidity_providing', 'yield_farming'] },
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'valueAtReceipt', label: 'Value at Receipt ($)', type: 'number' },
  { key: 'currentValue', label: 'Current Value ($)', type: 'number', default: '0' },
  { key: 'platform', label: 'Platform', type: 'text' },
  { key: 'pool', label: 'Pool', type: 'text' },
  { key: 'apy', label: 'APY (%)', type: 'number' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'pending'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function MiningStakingPage() {
  return (
    <CrudPage
      title="Mining & Staking"
      subtitle="AI-powered mining and staking income classification and tax analysis"
      api={miningStaking}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Analyze Income"
      aiAction={() => miningStaking.aiAnalyze()}
    />
  );
}
