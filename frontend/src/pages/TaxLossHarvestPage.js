import React from 'react';
import CrudPage from './CrudPage';
import { taxLossHarvest } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const statusBadge = (s) => {
  const m = { opportunity: 'badge-success', harvested: 'badge-primary', expired: 'badge-danger', watch: 'badge-warning' };
  return <span className={`badge ${m[s] || 'badge-primary'}`}>{s}</span>;
};

const columns = [
  { key: 'cryptocurrency', label: 'Crypto' },
  { key: 'symbol', label: 'Symbol', render: (v) => <span className="badge badge-primary">{v}</span> },
  { key: 'purchasePrice', label: 'Buy Price', render: (v) => fmt(v) },
  { key: 'currentPrice', label: 'Current', render: (v) => fmt(v) },
  { key: 'unrealizedLoss', label: 'Unrealized Loss', render: (v) => <span style={{ color: '#ef4444', fontWeight: 700 }}>{fmt(v)}</span> },
  { key: 'potentialTaxSaving', label: 'Tax Saving', render: (v) => <span style={{ color: '#10b981', fontWeight: 700 }}>{fmt(v)}</span> },
  { key: 'washSaleRisk', label: 'Wash Sale', render: (v) => v ? <span className="badge badge-danger">RISK</span> : <span className="badge badge-success">SAFE</span> },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
];

const detailFields = [
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'purchasePrice', label: 'Purchase Price', render: (v) => fmt(v) },
  { key: 'currentPrice', label: 'Current Price', render: (v) => fmt(v) },
  { key: 'amount', label: 'Amount' },
  { key: 'unrealizedLoss', label: 'Unrealized Loss', render: (v) => fmt(v) },
  { key: 'potentialTaxSaving', label: 'Potential Tax Saving', render: (v) => fmt(v) },
  { key: 'holdingPeriod', label: 'Holding Period (days)' },
  { key: 'replacementAsset', label: 'Replacement Asset' },
  { key: 'washSaleRisk', label: 'Wash Sale Risk', render: (v) => v ? 'YES - RISK' : 'No' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text' },
  { key: 'symbol', label: 'Symbol', type: 'text' },
  { key: 'purchasePrice', label: 'Purchase Price', type: 'number' },
  { key: 'currentPrice', label: 'Current Price', type: 'number' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'unrealizedLoss', label: 'Unrealized Loss', type: 'number' },
  { key: 'potentialTaxSaving', label: 'Potential Tax Saving', type: 'number', default: '0' },
  { key: 'holdingPeriod', label: 'Holding Period (days)', type: 'number' },
  { key: 'replacementAsset', label: 'Replacement Asset', type: 'text' },
  { key: 'washSaleRisk', label: 'Wash Sale Risk', type: 'select', options: ['false', 'true'] },
  { key: 'status', label: 'Status', type: 'select', options: ['opportunity', 'harvested', 'expired', 'watch'] },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function TaxLossHarvestPage() {
  return (
    <CrudPage
      title="Tax Loss Harvesting"
      subtitle="AI-identified opportunities to harvest losses and reduce your tax bill"
      api={taxLossHarvest}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Find Opportunities"
      aiAction={() => taxLossHarvest.aiOpportunities()}
    />
  );
}
