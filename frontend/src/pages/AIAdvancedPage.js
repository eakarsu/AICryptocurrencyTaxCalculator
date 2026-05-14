import React, { useState } from 'react';
import { aiCenter } from '../services/api';
import AIResponseDisplay from '../components/AIResponseDisplay';
import { FiActivity, FiGift, FiShield, FiGlobe, FiBriefcase, FiZap, FiCloud, FiPieChart, FiPlay, FiTag, FiLayers } from 'react-icons/fi';

const FEATURES = [
  {
    id: 'tax-bracket-forecaster',
    title: 'Tax Bracket Forecaster',
    desc: 'Project year-end tax liability and quarterly payments by filing status.',
    icon: <FiActivity />,
    action: 'taxBracketForecaster',
    fields: [
      { key: 'ytd_gains', label: 'YTD Gains ($)', type: 'number' },
      { key: 'ytd_losses', label: 'YTD Losses ($)', type: 'number' },
      { key: 'income', label: 'Other Income ($)', type: 'number' },
      { key: 'filing_status', label: 'Filing Status', type: 'select', options: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'] },
    ],
  },
  {
    id: 'donation-optimizer',
    title: 'Donation Optimizer',
    desc: 'Recommend appreciated assets to donate for max charitable deduction.',
    icon: <FiGift />,
    action: 'donationOptimizer',
    fields: [
      { key: 'portfolio', label: 'Portfolio (JSON array)', type: 'json', placeholder: '[{"asset":"BTC","amount":1,"costBasis":10000,"currentValue":50000}]' },
      { key: 'charity_goals', label: 'Charity Goals (JSON array)', type: 'json', placeholder: '["education","environment"]' },
    ],
  },
  {
    id: 'audit-defense',
    title: 'Audit Defense Generator',
    desc: 'Draft an IRS audit response narrative + documentation checklist.',
    icon: <FiShield />,
    action: 'auditDefense',
    fields: [
      { key: 'transaction_id', label: 'Transaction ID', type: 'number' },
    ],
  },
  {
    id: 'international-tax',
    title: 'International Tax Mapper',
    desc: 'Per-country reporting, treaty implications, FATF/AML thresholds.',
    icon: <FiGlobe />,
    action: 'internationalTax',
    fields: [
      { key: 'countries', label: 'Countries (JSON array)', type: 'json', placeholder: '["United States","Germany"]' },
      { key: 'crypto_holdings', label: 'Holdings (JSON array)', type: 'json', placeholder: '[{"asset":"BTC","amount":1,"value_usd":50000}]' },
    ],
  },
  {
    id: 'earned-income-split',
    title: 'Earned Income Split Analyzer',
    desc: 'Compare SE tax vs capital gains for active traders; surface QBI eligibility.',
    icon: <FiBriefcase />,
    action: 'earnedIncomeSplit',
    fields: [
      { key: 'annual_trades', label: 'Annual Trades', type: 'number' },
      { key: 'gross_revenue', label: 'Gross Revenue ($)', type: 'number' },
      { key: 'hours_per_week', label: 'Hours/Week', type: 'number' },
      { key: 'home_office_pct', label: 'Home Office %', type: 'number' },
      { key: 'equipment_costs', label: 'Equipment Costs ($)', type: 'number' },
    ],
  },
  {
    id: 'staking-reward-automator',
    title: 'Staking Reward Automator',
    desc: 'Categorize and value rewards by protocol; flag non-USD rewards.',
    icon: <FiZap />,
    action: 'stakingRewardAutomator',
    fields: [
      { key: 'protocols', label: 'Protocols (JSON array, optional)', type: 'json', placeholder: '["Ethereum","Solana"]' },
    ],
  },
  {
    id: 'carbon-offset-tax-credit',
    title: 'Carbon Offset Tax Credit Finder',
    desc: 'Identify federal/state credits (45Q, 48) for crypto mining ops.',
    icon: <FiCloud />,
    action: 'carbonOffsetTaxCredit',
    fields: [
      { key: 'mining_kwh_year', label: 'Mining kWh / Year', type: 'number' },
      { key: 'mining_revenue_year', label: 'Mining Revenue ($)', type: 'number' },
      { key: 'renewable_pct', label: 'Renewable %', type: 'number' },
      { key: 'carbon_credits_purchased_usd', label: 'Carbon Credits Purchased ($)', type: 'number' },
      { key: 'state', label: 'US State', type: 'text' },
    ],
  },
  {
    id: 'roth-conversion-simulator',
    title: 'Roth Conversion Simulator',
    desc: 'Multi-year traditional IRA to Roth simulation with crypto gain offset.',
    icon: <FiPieChart />,
    action: 'rothConversionSimulator',
    fields: [
      { key: 'traditional_ira_balance', label: 'Traditional IRA Balance ($)', type: 'number' },
      { key: 'current_age', label: 'Current Age', type: 'number' },
      { key: 'annual_income', label: 'Annual Income ($)', type: 'number' },
      { key: 'filing_status', label: 'Filing Status', type: 'select', options: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'] },
      { key: 'crypto_unrealized_gains_usd', label: 'Crypto Unrealized Gains ($)', type: 'number' },
      { key: 'conversion_amount_per_year', label: 'Conversion / Year ($)', type: 'number' },
      { key: 'years_to_convert', label: 'Years to Convert', type: 'number' },
    ],
  },
  {
    id: 'auto-categorize-transactions',
    title: 'Auto-Categorize Transactions',
    desc: 'Classify a batch of raw transactions into buy/sell/swap/airdrop/staking/etc.',
    icon: <FiTag />,
    action: 'autoCategorizeTransactions',
    fields: [
      { key: 'transactions', label: 'Transactions (JSON array)', type: 'json', placeholder: '[{"hash":"0x...","asset":"ETH","amount":1.5,"counterparty":"Uniswap","memo":"swap"}]' },
    ],
  },
  {
    id: 'analyze-defi-tax-implications',
    title: 'DeFi Tax Implications',
    desc: 'Tax characterization for a single DeFi position (lending, LP, staking, yield farming).',
    icon: <FiLayers />,
    action: 'analyzeDefiTaxImplications',
    fields: [
      { key: 'protocol', label: 'Protocol', type: 'text' },
      { key: 'position_type', label: 'Position Type', type: 'select', options: ['lending', 'lp', 'staking', 'yield_farming', 'borrowing', 'other'] },
      { key: 'asset', label: 'Asset', type: 'text' },
      { key: 'amount_usd', label: 'Amount ($)', type: 'number' },
      { key: 'duration_days', label: 'Duration (days)', type: 'number' },
      { key: 'rewards_received_usd', label: 'Rewards Received ($)', type: 'number' },
    ],
  },
];

function parseField(field, raw) {
  if (raw === '' || raw == null) return undefined;
  if (field.type === 'number') {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (field.type === 'json') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

export default function AIAdvancedPage() {
  const [active, setActive] = useState(FEATURES[0].id);
  const [formState, setFormState] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const feature = FEATURES.find(f => f.id === active);

  const handleChange = (fid, key, val) => {
    setFormState(prev => ({ ...prev, [fid]: { ...(prev[fid] || {}), [key]: val } }));
  };

  const handleRun = async () => {
    const fid = feature.id;
    setLoading(p => ({ ...p, [fid]: true }));
    setResults(p => ({ ...p, [fid]: null }));
    try {
      const payload = {};
      for (const f of feature.fields) {
        const v = parseField(f, (formState[fid] || {})[f.key]);
        if (v !== undefined) payload[f.key] = v;
      }
      const res = await aiCenter[feature.action](payload);
      setResults(p => ({ ...p, [fid]: res.data }));
    } catch (err) {
      setResults(p => ({ ...p, [fid]: { error: err.response?.data?.error || err.message, details: err.response?.data?.details } }));
    } finally {
      setLoading(p => ({ ...p, [fid]: false }));
    }
  };

  const result = results[feature.id];

  return (
    <div>
      <div className="page-header">
        <h2>AI Advanced Features</h2>
        <p>Specialized AI advisors for advanced crypto tax scenarios</p>
      </div>

      <div className="ai-features-grid">
        {FEATURES.map(f => (
          <div
            key={f.id}
            className={`ai-feature-card ${active === f.id ? 'active' : ''}`}
            onClick={() => setActive(f.id)}
            style={{ cursor: 'pointer', borderColor: active === f.id ? '#8b5cf6' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22, color: '#8b5cf6' }}>{f.icon}</span>
              <h4>{f.title}</h4>
            </div>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 20, border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}>
        <h3>{feature.title}</h3>
        <p style={{ color: '#94a3b8', marginBottom: 16 }}>{feature.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {feature.fields.map(field => (
            <div key={field.key} className="form-group">
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={(formState[feature.id] || {})[field.key] || ''}
                  onChange={(e) => handleChange(feature.id, field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, background: 'rgba(15,23,42,0.5)', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4 }}
                >
                  <option value="">Select...</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'json' ? (
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  value={(formState[feature.id] || {})[field.key] || ''}
                  onChange={(e) => handleChange(feature.id, field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, background: 'rgba(15,23,42,0.5)', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={(formState[feature.id] || {})[field.key] || ''}
                  onChange={(e) => handleChange(feature.id, field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, background: 'rgba(15,23,42,0.5)', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4 }}
                />
              )}
            </div>
          ))}
        </div>
        <button
          className="btn btn-ai"
          style={{ marginTop: 16 }}
          onClick={handleRun}
          disabled={loading[feature.id]}
        >
          <FiPlay /> {loading[feature.id] ? 'Running...' : 'Run AI Analysis'}
        </button>
      </div>

      {result && result.error && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 4, color: '#fca5a5' }}>
          <strong>Error:</strong> {result.error}
          {result.details && <pre style={{ marginTop: 8, fontSize: 11 }}>{JSON.stringify(result.details, null, 2)}</pre>}
        </div>
      )}

      {result && !result.error && (
        <div style={{ marginTop: 16 }}>
          <AIResponseDisplay
            content={result.raw || result.analysis || result.auditDefensePackage || ''}
            model={result.model}
            usage={result.usage}
            title={feature.title}
          />
          {result.parsed || (typeof result.analysis === 'object' && result.analysis) ? (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(15,23,42,0.5)', borderRadius: 4 }}>
              <h4 style={{ marginBottom: 8 }}>Structured JSON Result</h4>
              <pre style={{ fontSize: 11, overflowX: 'auto', color: '#cbd5e1' }}>
                {JSON.stringify(result.parsed || result.analysis, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
