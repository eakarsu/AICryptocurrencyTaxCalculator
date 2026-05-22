import React, { useEffect, useState } from 'react';
import axios from 'axios';

// NON-VIZ 2 — CRUD editor for jurisdiction/holding-period tax rules.
const API_BASE = 'http://localhost:4000/api/custom-views/tax-rules';

const blank = { jurisdiction: 'US', holdingPeriod: 'short', minDays: 0, maxDays: 365, rate: 0.22, description: '' };

export default function TaxRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState('');

  const load = () => {
    axios.get(API_BASE).then((r) => setRules(r.data.data || [])).catch((e) => setErr(e.message));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');
    const payload = { ...form, minDays: Number(form.minDays), maxDays: Number(form.maxDays), rate: Number(form.rate) };
    const req = editingId
      ? axios.put(`${API_BASE}/${editingId}`, payload)
      : axios.post(API_BASE, payload);
    req
      .then(() => { setForm(blank); setEditingId(null); load(); })
      .catch((e) => setErr(e.message));
  };

  const handleEdit = (r) => { setEditingId(r.id); setForm({ jurisdiction: r.jurisdiction, holdingPeriod: r.holdingPeriod, minDays: r.minDays, maxDays: r.maxDays, rate: r.rate, description: r.description }); };
  const handleDelete = (id) => { axios.delete(`${API_BASE}/${id}`).then(load).catch((e) => setErr(e.message)); };
  const handleCancel = () => { setForm(blank); setEditingId(null); };

  const inputStyle = { padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: 13 };

  return (
    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <h3 style={{ margin: '0 0 16px' }} data-testid="rules-editor-title">Tax Rules Editor</h3>
      {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>Error: {err}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '120px 130px 100px 100px 100px 1fr auto', gap: 8, marginBottom: 18, alignItems: 'center' }}>
        <select value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} style={inputStyle}>
          {['US', 'UK', 'DE', 'CA', 'AU', 'JP', 'FR'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.holdingPeriod} onChange={(e) => setForm({ ...form, holdingPeriod: e.target.value })} style={inputStyle}>
          {['short', 'long', 'any'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input type="number" placeholder="Min days" value={form.minDays} onChange={(e) => setForm({ ...form, minDays: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Max days" value={form.maxDays} onChange={(e) => setForm({ ...form, maxDays: e.target.value })} style={inputStyle} />
        <input type="number" step="0.01" placeholder="Rate" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} style={inputStyle} />
        <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="submit" style={{ background: editingId ? '#f59e0b' : '#10b981', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && <button type="button" onClick={handleCancel} style={{ background: '#6b7280', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Jurisdiction</th>
            <th style={{ padding: 8 }}>Period</th>
            <th style={{ padding: 8 }}>Min Days</th>
            <th style={{ padding: 8 }}>Max Days</th>
            <th style={{ padding: 8 }}>Rate</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Description</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={{ padding: 8 }}>{r.jurisdiction}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{r.holdingPeriod}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{r.minDays}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{r.maxDays}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{(r.rate * 100).toFixed(1)}%</td>
              <td style={{ padding: 8 }}>{r.description}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>
                <button onClick={() => handleEdit(r)} style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                <button onClick={() => handleDelete(r.id)} style={{ background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', opacity: 0.6 }}>No rules yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
