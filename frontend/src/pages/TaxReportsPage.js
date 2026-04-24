import React from 'react';
import CrudPage from './CrudPage';
import { taxReports } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const statusBadge = (s) => {
  const m = { draft: 'badge-warning', generated: 'badge-info', reviewed: 'badge-primary', filed: 'badge-success' };
  return <span className={`badge ${m[s] || 'badge-primary'}`}>{s}</span>;
};

const columns = [
  { key: 'taxYear', label: 'Tax Year' },
  { key: 'costBasisMethod', label: 'Method', render: (v) => <span className="badge badge-primary">{v}</span> },
  { key: 'totalGains', label: 'Total Gains', render: (v) => <span style={{ color: '#10b981' }}>{fmt(v)}</span> },
  { key: 'totalLosses', label: 'Total Losses', render: (v) => <span style={{ color: '#ef4444' }}>{fmt(v)}</span> },
  { key: 'netGainLoss', label: 'Net', render: (v) => <span style={{ color: Number(v) >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{fmt(v)}</span> },
  { key: 'estimatedTax', label: 'Est. Tax', render: (v) => fmt(v) },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'country', label: 'Country' },
];

const detailFields = [
  { key: 'taxYear', label: 'Tax Year' },
  { key: 'costBasisMethod', label: 'Cost Basis Method' },
  { key: 'totalGains', label: 'Total Gains', render: (v) => fmt(v) },
  { key: 'totalLosses', label: 'Total Losses', render: (v) => fmt(v) },
  { key: 'netGainLoss', label: 'Net Gain/Loss', render: (v) => fmt(v) },
  { key: 'shortTermGains', label: 'Short-Term Gains', render: (v) => fmt(v) },
  { key: 'longTermGains', label: 'Long-Term Gains', render: (v) => fmt(v) },
  { key: 'totalIncome', label: 'Total Income', render: (v) => fmt(v) },
  { key: 'estimatedTax', label: 'Estimated Tax', render: (v) => fmt(v) },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'country', label: 'Country' },
  { key: 'aiSummary', label: 'AI Summary' },
];

const formFields = [
  { key: 'taxYear', label: 'Tax Year', type: 'number', default: '2025' },
  { key: 'costBasisMethod', label: 'Cost Basis Method', type: 'select', options: ['FIFO', 'LIFO', 'HIFO', 'ACB', 'SpecificID'] },
  { key: 'totalGains', label: 'Total Gains', type: 'number', default: '0' },
  { key: 'totalLosses', label: 'Total Losses', type: 'number', default: '0' },
  { key: 'netGainLoss', label: 'Net Gain/Loss', type: 'number', default: '0' },
  { key: 'shortTermGains', label: 'Short-Term Gains', type: 'number', default: '0' },
  { key: 'longTermGains', label: 'Long-Term Gains', type: 'number', default: '0' },
  { key: 'totalIncome', label: 'Total Income', type: 'number', default: '0' },
  { key: 'estimatedTax', label: 'Estimated Tax', type: 'number', default: '0' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'generated', 'reviewed', 'filed'] },
  { key: 'country', label: 'Country', type: 'text', default: 'US' },
];

export default function TaxReportsPage() {
  return (
    <CrudPage
      title="Tax Reports"
      subtitle="AI-generated cryptocurrency tax reports with multi-method comparison"
      api={taxReports}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Generate Tax Report"
      aiAction={() => taxReports.aiGenerate({ taxYear: 2025, costBasisMethod: 'FIFO' })}
    />
  );
}
