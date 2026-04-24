import React from 'react';
import CrudPage from './CrudPage';
import { compliance } from '../services/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const statusBadge = (s) => {
  const m = { passed: 'badge-success', failed: 'badge-danger', warning: 'badge-warning', pending: 'badge-info', expired: 'badge-danger' };
  return <span className={`badge ${m[s] || 'badge-primary'}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const m = { low: 'badge-success', medium: 'badge-info', high: 'badge-warning', critical: 'badge-danger' };
  return <span className={`badge ${m[p] || 'badge-primary'}`}>{p}</span>;
};

const columns = [
  { key: 'checkType', label: 'Check Type', render: (v) => <span className="badge badge-primary">{v?.replace('_', ' ')}</span> },
  { key: 'description', label: 'Description', render: (v) => v?.substring(0, 40) + '...' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'priority', label: 'Priority', render: (v) => priorityBadge(v) },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'deadline', label: 'Deadline', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'checkType', label: 'Check Type' },
  { key: 'description', label: 'Description' },
  { key: 'details', label: 'Details' },
  { key: 'status', label: 'Status', render: (v) => statusBadge(v) },
  { key: 'priority', label: 'Priority', render: (v) => priorityBadge(v) },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'deadline', label: 'Deadline', render: (v) => fmtDate(v) },
  { key: 'aiRecommendation', label: 'AI Recommendation' },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'checkType', label: 'Check Type', type: 'select', options: ['kyc', 'aml', 'tax_filing', 'reporting', 'sanctions', 'travel_rule', 'record_keeping', 'form_8949', 'schedule_d', 'fbar'] },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'details', label: 'Details', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['passed', 'failed', 'warning', 'pending', 'expired'] },
  { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
  { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', default: 'US' },
  { key: 'deadline', label: 'Deadline', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function CompliancePage() {
  return (
    <CrudPage
      title="Compliance Checks"
      subtitle="AI regulatory compliance monitoring and deadline tracking"
      api={compliance}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Compliance Check"
      aiAction={() => compliance.aiCheck()}
    />
  );
}
