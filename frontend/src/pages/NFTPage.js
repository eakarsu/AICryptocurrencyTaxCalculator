import React from 'react';
import CrudPage from './CrudPage';
import { nft } from '../services/api';

const fmt = (n) => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '$0.00';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const typeBadge = (t) => {
  const m = { purchase: 'badge-info', sale: 'badge-success', mint: 'badge-primary', airdrop: 'badge-warning', gift: 'badge-warning', royalty: 'badge-success' };
  return <span className={`badge ${m[t] || 'badge-primary'}`}>{t}</span>;
};

const columns = [
  { key: 'nftName', label: 'NFT' },
  { key: 'collection', label: 'Collection' },
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'amount', label: 'Amount', render: (v) => `${Number(v).toFixed(3)} ETH` },
  { key: 'valueUSD', label: 'Value', render: (v) => fmt(v) },
  { key: 'gainLoss', label: 'Gain/Loss', render: (v) => v ? <span style={{ color: Number(v) >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{fmt(v)}</span> : '-' },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
];

const detailFields = [
  { key: 'nftName', label: 'NFT Name' },
  { key: 'collection', label: 'Collection' },
  { key: 'type', label: 'Type', render: (v) => typeBadge(v) },
  { key: 'cryptocurrency', label: 'Cryptocurrency' },
  { key: 'amount', label: 'Amount' },
  { key: 'valueUSD', label: 'Value USD', render: (v) => fmt(v) },
  { key: 'gasFee', label: 'Gas Fee' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'chain', label: 'Chain' },
  { key: 'costBasis', label: 'Cost Basis', render: (v) => fmt(v) },
  { key: 'gainLoss', label: 'Gain/Loss', render: (v) => fmt(v) },
  { key: 'date', label: 'Date', render: (v) => fmtDate(v) },
  { key: 'notes', label: 'Notes' },
];

const formFields = [
  { key: 'nftName', label: 'NFT Name', type: 'text' },
  { key: 'collection', label: 'Collection', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: ['purchase', 'sale', 'mint', 'airdrop', 'gift', 'royalty'] },
  { key: 'cryptocurrency', label: 'Cryptocurrency', type: 'text', default: 'ETH' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'valueUSD', label: 'Value USD', type: 'number' },
  { key: 'gasFee', label: 'Gas Fee', type: 'number', default: '0' },
  { key: 'marketplace', label: 'Marketplace', type: 'text' },
  { key: 'chain', label: 'Chain', type: 'text', default: 'Ethereum' },
  { key: 'costBasis', label: 'Cost Basis', type: 'number', default: '0' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export default function NFTPage() {
  return (
    <CrudPage
      title="NFT Transactions"
      subtitle="AI-powered NFT tax calculations including minting, trading, and royalties"
      api={nft}
      columns={columns}
      detailFields={detailFields}
      formFields={formFields}
      aiButtonLabel="AI Analyze NFTs"
      aiAction={() => nft.aiAnalyze()}
    />
  );
}
