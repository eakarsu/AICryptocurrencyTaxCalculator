import React from 'react';
import CrudPage from './CrudPage';
import { crossBorder } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const statusBadge = (s) => {
  const m = { pending: 'badge-warning', compliant: 'badge-success', needs_review: 'badge-danger', reported: 'badge-primary' };
  return <span className={`badge ${m[s] || 'badge-primary'}`}>{s?.replace('_', ' ')}</span>;
};

const columns = [
  { key: 'country', label: 'Country' },
  { key: 'cryptocurrency', label: 'Crypto' },
  { key: 'amount', label: 'Amount', render: (v) => Number(v).toFixed(4) },
  { key: 'valueUSD', label: 'Value USD', render: (v) => fmt(v) },
  { key: 'fbarRequired', label: 'FBAR', render: (v) => v ? <span className="badge badge-danger">Required</span> : <span className="badge badge-success">N/A</span> },
  { key: 'taxTreaty', label: 'Treaty', render: (v) => v ? 'Yes' : 'No' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'country', label: 'Country' },
  { key: 'taxResidency', label: 'Tax Residency' },
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'amount', label: 'Amount' },
  { key: 'valueUSD', label: 'Value USD', render: (v) => fmt(v) },
  { key: 'localCurrencyValue', label: 'Local Value', render: (v, row) => `${v} ${row.localCurrency}` },
  { key: 'taxTreaty', label: 'Tax Treaty', render: (v) => v ? 'Yes' : 'No' },
  { key: 'fbarRequired', label: 'FBAR Required', render: (v) => v ? 'Yes' : 'No' },
  { key: 'fatcaReporting', label: 'FATCA', render: (v) => v ? 'Yes' : 'No' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'taxResidency', label: 'Tax Residency', type: 'text', default: 'US' },
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'valueUSD', label: 'Value USD', type: 'number' },
  { key: 'localCurrencyValue', label: 'Local Currency Value', type: 'number' },
  { key: 'localCurrency', label: 'Local Currency', type: 'text' },
  { key: 'taxTreaty', label: 'Tax Treaty', type: 'select', options: ['false', 'true'] },
  { key: 'fbarRequired', label: 'FBAR Required', type: 'select', options: ['false', 'true'] },
  { key: 'fatcaReporting', label: 'FATCA Reporting', type: 'select', options: ['false', 'true'] },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: ['pending', 'compliant', 'needs_review', 'reported'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function CrossBorderPage() {
  return (
    <CrudPage
      title="Cross-Border Tax"
      subtitle="AI-powered international cryptocurrency tax compliance analysis"
      api={crossBorder}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Cross-Border Analysis"
      aiAction={() => crossBorder.aiAnalyze()}
    />
  );
}
