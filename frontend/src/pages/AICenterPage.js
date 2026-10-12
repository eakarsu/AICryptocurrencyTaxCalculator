import NativeAIControls from "../components/NativeAIControls.jsx";
import React, { useCallback, useEffect, useState } from 'react';
import { aiCenter } from '../services/api';
import AIResultView, { AIResultValue, reportValue } from './AIResultView';
import { FiSend, FiZap, FiTrendingUp, FiDollarSign, FiAlertTriangle, FiBarChart2, FiBookOpen, FiClipboard } from 'react-icons/fi';

const aiFeatures = [
  { id: 'tax-planning', title: 'AI Tax Planning', desc: 'Comprehensive year-end tax strategies and optimization', icon: <FiTrendingUp />, action: 'taxPlanning' },
  { id: 'cost-basis', title: 'Cost Basis Optimizer', desc: 'Compare FIFO, LIFO, HIFO methods for best outcome', icon: <FiDollarSign />, action: 'costBasisOptimize' },
  { id: 'wash-sale', title: 'Wash Sale Analyzer', desc: 'Detect potential wash sale violations in your trades', icon: <FiAlertTriangle />, action: 'washSaleCheck' },
  { id: 'portfolio-risk', title: 'Portfolio Tax Risk', desc: 'Tax-adjusted portfolio risk and harvesting priorities', icon: <FiBarChart2 />, action: 'portfolioTaxRisk' },
  { id: 'regulatory', title: 'Regulatory Updates', desc: 'Latest crypto tax regulations and compliance changes', icon: <FiBookOpen />, action: 'regulatoryUpdates' },
  { id: 'full-summary', title: 'Full Tax Summary', desc: 'Complete executive summary of your crypto tax position', icon: <FiClipboard />, action: 'fullSummary' },
];

export default function AICenterPage() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [featureResult, setFeatureResult] = useState(null);
  const [featureLoading, setFeatureLoading] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [savedResults, setSavedResults] = useState([]);
  const [savedResult, setSavedResult] = useState(null);

  const loadSavedResults = useCallback(async () => {
    try {
      const response = await aiCenter.chatHistory({ page: 1, limit: 50 });
      const rows = response.data?.data || [];
      setSavedResults(rows.filter((item) => item.role === 'assistant'));
    } catch (_) {
      setSavedResults([]);
    }
  }, []);

  useEffect(() => { loadSavedResults(); }, [loadSavedResults]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await aiCenter.chat({ message: userMsg, sessionId, feature: 'general' });
      setSessionId(res.data.sessionId);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response, model: res.data.model, usage: res.data.usage }]);
      loadSavedResults();
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.response?.data?.error || err.message) }]);
    }
    setChatLoading(false);
  };

  const handleFeature = async (feature) => {
    setFeatureLoading(feature.id);
    setFeatureResult(null);
    setActiveTab('features');
    try {
      const res = await aiCenter[feature.action]();
      setFeatureResult({ ...res.data, title: feature.title });
    } catch (err) {
      setFeatureResult({ analysis: 'Error: ' + (err.response?.data?.error || err.message), title: feature.title });
    }
    setFeatureLoading('');
  };

  return (
    <NativeAIControls busy={false} context="CryptocurrencyTaxCalculator"><div>
      <div className="page-header">
        <h2>AI Command Center</h2>
        <p>All AI-powered crypto tax features in one place</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('chat')}>
          AI Chat Assistant
        </button>
        <button className={`btn ${activeTab === 'features' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('features')}>
          AI Features
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="ai-chat-container">
          <div className="ai-chat-messages">
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                <FiZap size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3 style={{ marginBottom: 8, color: '#e2e8f0' }}>AI Tax Assistant</h3>
                <p>Ask me anything about cryptocurrency taxes, regulations, or tax optimization strategies.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                  {['How do I report staking rewards?', 'What is wash sale rule for crypto?', 'How to reduce my crypto tax bill?', 'Explain DeFi tax implications'].map(q => (
                    <button key={q} className="btn btn-secondary btn-sm" onClick={() => { setChatInput(q); }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}>
                <div className={`chat-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="ai-response-content">
                      <AIResultValue value={reportValue(msg.content)} />
                      {msg.model && (
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, borderTop: '1px solid rgba(99,102,241,0.2)', paddingTop: 8 }}>
                          Model: {msg.model} | Tokens: {msg.usage?.total_tokens || 'N/A'}
                        </div>
                      )}
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message">
                <div className="chat-avatar ai">AI</div>
                <div className="chat-bubble ai">
                  <div className="loading" style={{ padding: 8 }}><div className="spinner" style={{ width: 20, height: 20 }}></div>Thinking...</div>
                </div>
              </div>
            )}
          </div>
          <form className="ai-chat-input" onSubmit={handleSendChat}>
            <input data-ai-field={"chatInput"}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about crypto taxes, regulations, strategies..."
              disabled={chatLoading}
            />
            <button className="btn btn-ai" type="submit" disabled={chatLoading || !chatInput.trim()}>
              <FiSend /> Send
            </button>
          </form>
        </div>
      )}

      {activeTab === 'features' && (
        <>
          <div className="ai-features-grid">
            {aiFeatures.map((f) => (
              <div key={f.id} className="ai-feature-card" onClick={() => handleFeature(f)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, color: '#8b5cf6' }}>{f.icon}</span>
                  <h4>{f.title}</h4>
                </div>
                <p>{f.desc}</p>
                {featureLoading === f.id && (
                  <div className="loading" style={{ padding: 8, justifyContent: 'flex-start' }}>
                    <div className="spinner" style={{ width: 16, height: 16 }}></div>
                    <span style={{ fontSize: 12 }}>Analyzing...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {featureResult && (
            <AIResultView
              response={featureResult}
              title={featureResult.title}
              label="AI analysis"
            />
          )}
        </>
      )}

      {savedResults.length > 0 && (
        <section className="ai-history" aria-label="Saved AI results">
          <h2>Saved AI results</h2>
          <p className="ai-muted">Open a saved response to review the same readable report presentation.</p>
          {savedResults.slice(0, 10).map((item) => (
            <button type="button" className="ai-history-row" key={item.id} onClick={() => setSavedResult(item)}>
              <span><strong>{String(item.feature || 'AI report').replace(/[_-]+/g, ' ')}</strong><br /><small>{new Date(item.createdAt || item.created_at).toLocaleString()}</small></span>
              <span>Open report →</span>
            </button>
          ))}
          {savedResult && (
            <AIResultView
              response={savedResult.ai_results || savedResult.message}
              title={String(savedResult.feature || 'Saved AI result').replace(/[_-]+/g, ' ')}
              tokens={savedResult.tokens}
              label="Saved AI result"
            />
          )}
        </section>
      )}
    </div></NativeAIControls>
  );
}
