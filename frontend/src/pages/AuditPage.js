import React from 'react';
import CrudPage from './CrudPage';
import { audit } from '../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const riskBadge = (r) => {
  const m = { low: 'badge-success', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger' };
  return <span className={`badge ${m[r] || 'badge-primary'}`}>{r}</span>;
};

const columns = [
  { key: 'action', label: 'Action' },
  { key: 'entity', label: 'Entity' },
  { key: 'riskLevel', label: 'Risk', render: (v) => riskBadge(v) },
  { key: 'flagged', label: 'Flagged', render: (v) => v ? <span className="badge badge-danger">FLAGGED</span> : <span className="badge badge-success">CLEAR</span> },
  { key: 'details', label: 'Details', render: (v) => v?.substring(0, 50) + '...' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'action', label: 'Action' },
  { key: 'entity', label: 'Entity' },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'riskLevel', label: 'Risk Level', render: (v) => riskBadge(v) },
  { key: 'flagged', label: 'Flagged', render: (v) => v ? 'Yes' : 'No' },
  { key: 'details', label: 'Details' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'action', label: 'Action', type: 'text' },
  { key: 'entity', label: 'Entity', type: 'text' },
  { key: 'entityId', label: 'Entity ID', type: 'number' },
  { key: 'details', label: 'Details', type: 'textarea' },
  { key: 'riskLevel', label: 'Risk Level', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
  { key: 'flagged', label: 'Flagged', type: 'select', options: ['false', 'true'] },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function AuditPage() {
  return (
    <CrudPage
      title="Audit & Risk"
      subtitle="AI-powered audit risk assessment and red flag detection"
      api={audit}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Risk Assessment"
      aiAction={() => audit.aiRiskAssessment()}
    />
  );
}
