import React from 'react';
import CrudPage from './CrudPage';
import { defi } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

const columns = [
  { key: 'protocol', label: 'Protocol' },
  { key: 'activityType', label: 'Activity', render: (v) => <span className="badge badge-info">{v?.replace('_', ' ')}</span> },
  { key: 'tokenIn', label: 'Token In' },
  { key: 'tokenOut', label: 'Token Out' },
  { key: 'valueUSD', label: 'Value USD', render: (v) => fmt(v) },
  { key: 'chain', label: 'Chain' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'protocol', label: 'Protocol' },
  { key: 'activityType', label: 'Activity Type' },
  { key: 'tokenIn', label: 'Token In' },
  { key: 'amountIn', label: 'Amount In' },
  { key: 'tokenOut', label: 'Token Out' },
  { key: 'amountOut', label: 'Amount Out' },
  { key: 'valueUSD', label: 'Value USD', render: (v) => fmt(v) },
  { key: 'gasFee', label: 'Gas Fee' },
  { key: 'chain', label: 'Chain' },
  { key: 'taxImplication', label: 'Tax Implication' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'protocol', label: 'Protocol', type: 'text' },
  { key: 'activityType', label: 'Activity Type', type: 'select', options: ['swap', 'liquidity_add', 'liquidity_remove', 'lending', 'borrowing', 'yield_farming', 'flash_loan', 'bridge', 'wrap', 'unwrap'] },
  { key: 'tokenIn', label: 'Token In', type: 'text' },
  { key: 'amountIn', label: 'Amount In', type: 'number' },
  { key: 'tokenOut', label: 'Token Out', type: 'text' },
  { key: 'amountOut', label: 'Amount Out', type: 'number' },
  { key: 'valueUSD', label: 'Value USD', type: 'number' },
  { key: 'gasFee', label: 'Gas Fee', type: 'number', default: '0' },
  { key: 'chain', label: 'Chain', type: 'text', default: 'Ethereum' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'taxImplication', label: 'Tax Implication', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function DeFiPage() {
  return (
    <CrudPage
      title="DeFi Activities"
      subtitle="AI analysis of complex DeFi transactions and tax implications"
      api={defi}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Analyze DeFi"
      aiAction={() => defi.aiAnalyze()}
    />
  );
}
