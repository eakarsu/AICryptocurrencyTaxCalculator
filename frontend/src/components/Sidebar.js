import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiRepeat, FiPieChart, FiFileText, FiCpu, FiLayers, FiImage, FiTrendingDown, FiShield, FiGlobe, FiCheckCircle, FiZap } from 'react-icons/fi';

const navItems = [
  { section: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/' },
  ]},
  { section: 'Tax Management', items: [
    { id: 'transactions', label: 'Transactions', icon: <FiRepeat />, path: '/transactions' },
    { id: 'portfolio', label: 'Portfolio Tracker', icon: <FiPieChart />, path: '/portfolio' },
    { id: 'tax-reports', label: 'Tax Reports', icon: <FiFileText />, path: '/tax-reports' },
    { id: 'tax-loss-harvest', label: 'Tax Loss Harvesting', icon: <FiTrendingDown />, path: '/tax-loss-harvest' },
  ]},
  { section: 'Crypto Activities', items: [
    { id: 'mining-staking', label: 'Mining & Staking', icon: <FiCpu />, path: '/mining-staking' },
    { id: 'defi', label: 'DeFi Activities', icon: <FiLayers />, path: '/defi' },
    { id: 'nft', label: 'NFT Transactions', icon: <FiImage />, path: '/nft' },
  ]},
  { section: 'Compliance', items: [
    { id: 'audit', label: 'Audit & Risk', icon: <FiShield />, path: '/audit' },
    { id: 'cross-border', label: 'Cross-Border Tax', icon: <FiGlobe />, path: '/cross-border' },
    { id: 'compliance', label: 'Compliance Checks', icon: <FiCheckCircle />, path: '/compliance' },
  ]},
  { section: 'AI Intelligence', items: [
    { id: 'ai-center', label: 'AI Center', icon: <FiZap />, path: '/ai-center' },
  ]},
];

export default function Sidebar({ user, activeNav, setActiveNav, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>CryptoTax AI</h1>
        <p>Intelligent Tax Calculator</p>
      </div>
      <div className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => { setActiveNav(item.id); navigate(item.path); }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user.name?.charAt(0)}</div>
          <div className="user-details">
            <p>{user.name}</p>
            <span>{user.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}
