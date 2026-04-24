import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import TransactionsPage from './pages/TransactionsPage';
import PortfolioPage from './pages/PortfolioPage';
import TaxReportsPage from './pages/TaxReportsPage';
import MiningStakingPage from './pages/MiningStakingPage';
import DeFiPage from './pages/DeFiPage';
import NFTPage from './pages/NFTPage';
import TaxLossHarvestPage from './pages/TaxLossHarvestPage';
import AuditPage from './pages/AuditPage';
import CrossBorderPage from './pages/CrossBorderPage';
import CompliancePage from './pages/CompliancePage';
import AICenterPage from './pages/AICenterPage';

function App() {
  const [user, setUser] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar user={user} activeNav={activeNav} setActiveNav={setActiveNav} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard setActiveNav={setActiveNav} />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/tax-reports" element={<TaxReportsPage />} />
            <Route path="/mining-staking" element={<MiningStakingPage />} />
            <Route path="/defi" element={<DeFiPage />} />
            <Route path="/nft" element={<NFTPage />} />
            <Route path="/tax-loss-harvest" element={<TaxLossHarvestPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/cross-border" element={<CrossBorderPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/ai-center" element={<AICenterPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
