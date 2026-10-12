import AIFieldPresets, { completeExample } from './AIFieldPresets';
import AIResultView from './AIResultView';
import React, { useEffect, useState } from 'react';
import { aiCenter, transactions } from '../services/api';
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

const FEATURE_EXAMPLES = {
  'tax-bracket-forecaster': [
    { ytd_gains: 18500, ytd_losses: 3200, income: 92000, filing_status: 'single' },
    { ytd_gains: 42000, ytd_losses: 11800, income: 165000, filing_status: 'married_filing_jointly' },
    { ytd_gains: 7800, ytd_losses: 12600, income: 71000, filing_status: 'head_of_household' },
  ],
  'donation-optimizer': [
    { portfolio: [{ asset: 'BTC', amount: 0.4, costBasis: 8400, currentValue: 26000 }], charity_goals: ['education', 'food security'] },
    { portfolio: [{ asset: 'ETH', amount: 3, costBasis: 4800, currentValue: 10200 }], charity_goals: ['climate resilience'] },
    { portfolio: [{ asset: 'SOL', amount: 40, costBasis: 2400, currentValue: 7200 }], charity_goals: ['community health', 'arts'] },
  ],
  'audit-defense': [{}, {}, {}],
  'international-tax': [
    { countries: ['United States', 'Germany'], crypto_holdings: [{ asset: 'BTC', amount: 0.5, value_usd: 32500 }] },
    { countries: ['United States', 'Canada'], crypto_holdings: [{ asset: 'ETH', amount: 4, value_usd: 13600 }] },
    { countries: ['United States', 'Japan'], crypto_holdings: [{ asset: 'SOL', amount: 75, value_usd: 13500 }] },
  ],
  'earned-income-split': [
    { annual_trades: 480, gross_revenue: 125000, hours_per_week: 28, home_office_pct: 12, equipment_costs: 6800 },
    { annual_trades: 1200, gross_revenue: 310000, hours_per_week: 45, home_office_pct: 18, equipment_costs: 14200 },
    { annual_trades: 160, gross_revenue: 62000, hours_per_week: 12, home_office_pct: 8, equipment_costs: 3200 },
  ],
  'staking-reward-automator': [
    { protocols: ['Ethereum', 'Solana'] },
    { protocols: ['Cardano', 'Polkadot'] },
    { protocols: ['Cosmos', 'Avalanche'] },
  ],
  'carbon-offset-tax-credit': [
    { mining_kwh_year: 180000, mining_revenue_year: 95000, renewable_pct: 35, carbon_credits_purchased_usd: 4200, state: 'Texas' },
    { mining_kwh_year: 420000, mining_revenue_year: 240000, renewable_pct: 68, carbon_credits_purchased_usd: 12500, state: 'New York' },
    { mining_kwh_year: 90000, mining_revenue_year: 56000, renewable_pct: 92, carbon_credits_purchased_usd: 1800, state: 'Oregon' },
  ],
  'roth-conversion-simulator': [
    { traditional_ira_balance: 420000, current_age: 42, annual_income: 145000, filing_status: 'single', crypto_unrealized_gains_usd: 78000, conversion_amount_per_year: 35000, years_to_convert: 8 },
    { traditional_ira_balance: 780000, current_age: 55, annual_income: 210000, filing_status: 'married_filing_jointly', crypto_unrealized_gains_usd: 165000, conversion_amount_per_year: 60000, years_to_convert: 10 },
    { traditional_ira_balance: 265000, current_age: 34, annual_income: 98000, filing_status: 'head_of_household', crypto_unrealized_gains_usd: 42000, conversion_amount_per_year: 25000, years_to_convert: 6 },
  ],
  'auto-categorize-transactions': [
    { transactions: [{ hash: '0xabc123', asset: 'ETH', amount: 1.5, counterparty: 'Uniswap', memo: 'swap ETH for USDC' }] },
    { transactions: [{ hash: '0xdef456', asset: 'SOL', amount: 12, counterparty: 'Phantom', memo: 'staking reward' }] },
    { transactions: [{ hash: '0x987fed', asset: 'BTC', amount: 0.08, counterparty: 'Coinbase', memo: 'sale for USD' }] },
  ],
  'analyze-defi-tax-implications': [
    { protocol: 'Aave', position_type: 'lending', asset: 'USDC', amount_usd: 25000, duration_days: 180, rewards_received_usd: 860 },
    { protocol: 'Uniswap V3', position_type: 'lp', asset: 'ETH-USDC', amount_usd: 42000, duration_days: 95, rewards_received_usd: 2100 },
    { protocol: 'Lido', position_type: 'staking', asset: 'ETH', amount_usd: 18000, duration_days: 365, rewards_received_usd: 920 },
  ],
};

const examplesFor = (feature) => (FEATURE_EXAMPLES[feature.id] || [{}, {}, {}]).map((values, index) => ({
  label: ['Conservative example', 'Growth example', 'Detailed example'][index],
  values,
}));

const REQUIRED_FIELDS = {
  'tax-bracket-forecaster': ['ytd_gains', 'ytd_losses', 'income', 'filing_status'],
  'donation-optimizer': ['portfolio', 'charity_goals'],
  'audit-defense': ['transaction_id'],
  'international-tax': ['countries', 'crypto_holdings'],
  'earned-income-split': ['annual_trades', 'gross_revenue', 'hours_per_week'],
  'roth-conversion-simulator': ['traditional_ira_balance', 'current_age', 'annual_income', 'filing_status', 'conversion_amount_per_year', 'years_to_convert'],
  'auto-categorize-transactions': ['transactions'],
  'analyze-defi-tax-implications': ['protocol', 'position_type', 'asset', 'amount_usd'],
};
const isRequired = (featureId, key) => (REQUIRED_FIELDS[featureId] || []).includes(key);

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
  const [transactionRows, setTransactionRows] = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  useEffect(() => {
    let active = true;
    Promise.allSettled([transactions.getAll(), aiCenter.chatHistory({ page: 1, limit: 100 })]).then(([transactionResponse, historyResponse]) => {
      if (!active) return;
      if (transactionResponse.status === 'fulfilled') {
        const data = transactionResponse.value.data ?? transactionResponse.value;
        setTransactionRows(Array.isArray(data) ? data : data.data || data.records || []);
      }
      if (historyResponse.status === 'fulfilled') {
        const rows = historyResponse.value.data?.data || [];
        setSavedResults(rows.filter((item) => item.role === 'assistant'));
      }
    });
    return () => { active = false; };
  }, []);
  const [active, setActive] = useState(FEATURES[0].id);
  const [formState, setFormState] = useState({});
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const feature = FEATURES.find(f => f.id === active);

  const fieldsFor = (selected) => selected.fields.map(field => field.key === 'transaction_id' ? { ...field, type: 'select', requiresExistingRecord: true, options: transactionRows.map(row => ({ value: String(row.id), label: row.hash || row.asset || `Transaction #${row.id}` })) } : field);
  const presetFields = fieldsFor(feature);
  const fillExample = (selected, sample, index = 0) => { setFormState(current => ({ ...current, [selected.id]: completeExample(fieldsFor(selected), sample, index, selected.title, current[selected.id] || {}) })); setResults(current => ({ ...current, [selected.id]: null })); };
  const missingReference = presetFields.some(field => field.requiresExistingRecord && !formState[feature.id]?.[field.key]);

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
      aiCenter.chatHistory({ page: 1, limit: 100 }).then((history) => {
        const rows = history.data?.data || [];
        setSavedResults(rows.filter((item) => item.role === 'assistant'));
      }).catch(() => {});
    } catch (err) {
      setResults(p => ({ ...p, [fid]: { error: err.response?.data?.error || err.message, details: err.response?.data?.details } }));
    } finally {
      setLoading(p => ({ ...p, [fid]: false }));
    }
  };

  const result = results[feature.id];
  const savedForFeature = savedResults.filter((item) => item.feature === feature.id.replace(/-/g, '_'));

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
            onClick={() => { setActive(f.id); fillExample(f, examplesFor(f)[0], 0); }}
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
        <AIFieldPresets fields={presetFields} samples={examplesFor(feature)} disabled={loading[feature.id]} context={feature.title} onFill={(sample, index) => fillExample(feature, sample, index)} />
        {missingReference && <p role="status">Choose an actual transaction from your account before generating an audit-defense narrative. Examples never invent transaction IDs.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {presetFields.map(field => (
            <div key={field.key} className="form-group">
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                {field.label} <small style={{ color: '#94a3b8' }}>{isRequired(feature.id, field.key) ? 'Required' : 'Optional'}</small>
              </label>
              {field.type === 'select' ? (
                <select
                  value={(formState[feature.id] || {})[field.key] ?? ''}
                  onChange={(e) => handleChange(feature.id, field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, background: 'rgba(15,23,42,0.5)', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4 }}
                >
                  <option value="">Select...</option>
                  {field.options.map(option => <option key={typeof option === 'object' ? option.value : option} value={typeof option === 'object' ? option.value : option}>{typeof option === 'object' ? option.label : option}</option>)}
                </select>
              ) : field.type === 'json' ? (
                <textarea
                  rows={3}
                  placeholder={field.placeholder}
                  value={(formState[feature.id] || {})[field.key] ?? ''}
                  onChange={(e) => handleChange(feature.id, field.key, e.target.value)}
                  style={{ width: '100%', padding: 8, background: 'rgba(15,23,42,0.5)', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={(formState[feature.id] || {})[field.key] ?? ''}
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
          disabled={loading[feature.id] || missingReference}
        >
          <FiPlay /> {loading[feature.id] ? 'Running...' : 'Run AI Analysis'}
        </button>
      </div>

      {result && result.error && (
        <AIResultView
          response={result.details}
          error={result.error}
          title={`${feature.title} error`}
          label="Request error"
        />
      )}

      {result && !result.error && (
        <AIResultView
          response={result.parsed || result.analysis || result.auditDefensePackage || result}
          model={result.model}
          tokens={result.usage}
          title={feature.title}
          label="AI analysis"
        />
      )}

      {savedForFeature.length > 0 && (
        <section className="ai-history" aria-label={`Saved ${feature.title} results`}>
          <h2>Saved results</h2>
          <p className="ai-muted">Previously saved responses use the same readable sections, lists, and tables.</p>
          {savedForFeature.slice(0, 5).map((item) => (
            <details key={item.id} className="ai-history-row">
              <summary>{new Date(item.createdAt || item.created_at).toLocaleString()}</summary>
              <AIResultView
                response={item.ai_results || item.message}
                tokens={item.tokens}
                title={feature.title}
                label="Saved AI result"
              />
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
