import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolio, transactions, taxReports } from '../services/api';
import { FiRepeat, FiPieChart, FiFileText, FiCpu, FiLayers, FiImage, FiTrendingDown, FiShield, FiGlobe, FiCheckCircle, FiZap } from 'react-icons/fi';

const features = [
  { id: 'transactions', title: 'Transaction Tracker', desc: 'AI-powered transaction classification and tax categorization', icon: <FiRepeat />, color: '#6366f1', path: '/transactions' },
  { id: 'portfolio', title: 'Portfolio Analysis', desc: 'AI portfolio health assessment with tax optimization', icon: <FiPieChart />, color: '#0ea5e9', path: '/portfolio' },
  { id: 'tax-reports', title: 'Tax Report Generator', desc: 'AI-generated comprehensive crypto tax reports', icon: <FiFileText />, color: '#10b981', path: '/tax-reports' },
  { id: 'mining-staking', title: 'Mining & Staking', desc: 'AI income classification for mining and staking rewards', icon: <FiCpu />, color: '#f59e0b', path: '/mining-staking' },
  { id: 'defi', title: 'DeFi Tax Analyzer', desc: 'AI analysis of complex DeFi transactions', icon: <FiLayers />, color: '#8b5cf6', path: '/defi' },
  { id: 'nft', title: 'NFT Tax Calculator', desc: 'AI-powered NFT transaction tax calculations', icon: <FiImage />, color: '#ec4899', path: '/nft' },
  { id: 'tax-loss-harvest', title: 'Tax Loss Harvesting', desc: 'AI identifies optimal harvesting opportunities', icon: <FiTrendingDown />, color: '#14b8a6', path: '/tax-loss-harvest' },
  { id: 'audit', title: 'Audit Risk Assessment', desc: 'AI evaluates your audit risk and red flags', icon: <FiShield />, color: '#ef4444', path: '/audit' },
  { id: 'cross-border', title: 'Cross-Border Tax', desc: 'AI handles international crypto tax compliance', icon: <FiGlobe />, color: '#06b6d4', path: '/cross-border' },
  { id: 'compliance', title: 'Compliance Checker', desc: 'AI regulatory compliance monitoring', icon: <FiCheckCircle />, color: '#84cc16', path: '/compliance' },
  { id: 'ai-center', title: 'AI Command Center', desc: 'All AI features in one place - chat, planning, analysis', icon: <FiZap />, color: '#a855f7', path: '/ai-center' },
];

export default function Dashboard({ setActiveNav }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ portfolioValue: 0, totalGains: 0, totalLosses: 0, txCount: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [p, t, r] = await Promise.all([portfolio.getAll(), transactions.getAll(), taxReports.getAll()]);
        const pValue = p.data.reduce((sum, h) => sum + Number(h.currentPrice) * Number(h.amount), 0);
        const gains = r.data.reduce((sum, rep) => sum + Number(rep.totalGains), 0);
        const losses = r.data.reduce((sum, rep) => sum + Number(rep.totalLosses), 0);
        setStats({ portfolioValue: pValue, totalGains: gains, totalLosses: losses, txCount: t.data.length });
      } catch (e) { console.error(e); }
    }
    loadStats();
  }, []);

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="dashboard-welcome">
        <h2>Welcome to CryptoTax AI</h2>
        <p>Your intelligent cryptocurrency tax management platform powered by AI</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value" style={{ color: '#6366f1' }}>{fmt(stats.portfolioValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Gains</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{fmt(stats.totalGains)}</div>
          <div className="stat-change positive">Capital gains across all years</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Losses</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{fmt(stats.totalLosses)}</div>
          <div className="stat-change negative">Deductible losses available</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>{stats.txCount}</div>
          <div className="stat-change">Total tracked transactions</div>
        </div>
      </div>

      <div className="page-header">
        <h2>Features</h2>
        <p>Click any card to access the full feature with AI capabilities</p>
      </div>

      <div className="cards-grid">
        {features.map((f) => (
          <div key={f.id} className="card" onClick={() => { setActiveNav(f.id); navigate(f.path); }}>
            <div className="card-icon" style={{ background: `${f.color}20`, color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
