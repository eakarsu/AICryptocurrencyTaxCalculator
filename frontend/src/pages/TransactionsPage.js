import React from 'react';
import CrudPage from './CrudPage';
import { transactions } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

const typeBadge = (type) => {
  const colors = { buy: 'badge-success', sell: 'badge-danger', swap: 'badge-info', transfer: 'badge-primary', airdrop: 'badge-warning', mining: 'badge-warning', staking: 'badge-info', defi_yield: 'badge-success' };
  return <span className={`badge ${colors[type] || 'badge-primary'}`}>{type}</span>;
};

const columns = [
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'cryptocurrency', label: 'Crypto' },
  { key: 'amount', label: 'Amount', render: (v) => Number(v).toFixed(4) },
  { key: 'totalValue', label: 'Total Value', render: (v) => fmt(v) },
  { key: 'exchange', label: 'Exchange' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'amount', label: 'Amount' },
  { key: 'pricePerUnit', label: 'Price/Unit', render: (v) => fmt(v) },
  { key: 'totalValue', label: 'Total Value', render: (v) => fmt(v) },
  { key: 'fee', label: 'Fee' },
  { key: 'exchange', label: 'Exchange' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'category', label: 'Category' },
  { key: 'taxYear', label: 'Tax Year' },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'type', label: 'Type', type: 'select', options: ['buy', 'sell', 'transfer', 'swap', 'airdrop', 'mining', 'staking', 'nft_purchase', 'nft_sale', 'defi_yield', 'gift_received', 'gift_sent', 'fork', 'ico', 'margin_trade'] },
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'pricePerUnit', label: 'Price Per Unit', type: 'number' },
  { key: 'totalValue', label: 'Total Value', type: 'number' },
  { key: 'fee', label: 'Fee', type: 'number', default: '0' },
  { key: 'exchange', label: 'Exchange', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'taxYear', label: 'Tax Year', type: 'number', default: '2025' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function TransactionsPage() {
  return (
    <CrudPage
      title="Transactions"
      subtitle="Track and classify all your cryptocurrency transactions with AI"
      api={transactions}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Classify Transactions"
      aiAction={() => transactions.aiClassify({ transactionData: 'all transactions' })}
    />
  );
}
