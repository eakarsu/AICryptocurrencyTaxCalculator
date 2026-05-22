import React, { useEffect, useState } from 'react';
import axios from 'axios';

// NON-VIZ 1 — Form 8949 / 1099-style document. Browser-native print emits PDF.
export default function Form8949PDF() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = (y) => {
    setErr('');
    axios
      .get(`http://localhost:4000/api/custom-views/form-8949?year=${y}`)
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  };

  useEffect(() => { load(year); }, [year]);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w || !data) return;
    const rowsHtml = data.rows.map((r) =>
      `<tr><td>${r.description}</td><td>${r.dateAcquired}</td><td>${r.dateSold}</td><td style="text-align:right">$${r.proceeds.toLocaleString()}</td><td style="text-align:right">$${r.cost.toLocaleString()}</td><td style="text-align:right;color:${r.gainLoss >= 0 ? 'green' : 'red'}">$${r.gainLoss.toLocaleString()}</td><td>${r.term}</td></tr>`
    ).join('');
    w.document.write(`<!doctype html><html><head><title>${data.form} ${data.taxYear}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}
      h1{margin:0 0 6px} h3{margin:4px 0 16px;color:#555}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{border:1px solid #999;padding:8px 10px;font-size:12px}
      th{background:#eee;text-align:left}
      .meta{display:flex;gap:30px;font-size:13px;margin:10px 0 20px}
      .totals{margin-top:14px;font-weight:700}</style></head><body>
      <h1>${data.form}</h1><h3>Tax Year ${data.taxYear} • Generated ${new Date(data.generatedAt).toLocaleString()}</h3>
      <div class="meta"><div><strong>Filer:</strong> ${data.filer.name}</div><div><strong>TIN:</strong> ${data.filer.tin}</div></div>
      <table><thead><tr><th>Description</th><th>Date Acquired</th><th>Date Sold</th><th>Proceeds</th><th>Cost Basis</th><th>Gain/(Loss)</th><th>Term</th></tr></thead>
      <tbody>${rowsHtml}</tbody></table>
      <div class="totals">Totals — Proceeds: $${data.totals.proceeds.toLocaleString()} • Cost: $${data.totals.cost.toLocaleString()} • Net G/L: $${data.totals.gainLoss.toLocaleString()}</div>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div>Loading form…</div>;

  return (
    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }} data-testid="form-8949-title">Form 8949 / 1099-B (Composite)</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ padding: '6px 10px', borderRadius: 6 }}>
            {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handlePrint} style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Print / Save PDF
          </button>
        </div>
      </div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
        Filer: <strong>{data.filer.name}</strong> &nbsp;•&nbsp; TIN: <strong>{data.filer.tin}</strong>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Description</th>
            <th style={{ padding: 8 }}>Acquired</th>
            <th style={{ padding: 8 }}>Sold</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Proceeds</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Cost Basis</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Gain/(Loss)</th>
            <th style={{ padding: 8 }}>Term</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={{ padding: 8 }}>{r.description}</td>
              <td style={{ padding: 8 }}>{r.dateAcquired}</td>
              <td style={{ padding: 8 }}>{r.dateSold}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${r.proceeds.toLocaleString()}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${r.cost.toLocaleString()}</td>
              <td style={{ padding: 8, textAlign: 'right', color: r.gainLoss >= 0 ? '#10b981' : '#ef4444' }}>
                ${r.gainLoss.toLocaleString()}
              </td>
              <td style={{ padding: 8 }}>{r.term}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, fontSize: 13 }}>
        Totals — Proceeds: <strong>${data.totals.proceeds.toLocaleString()}</strong> • Cost: <strong>${data.totals.cost.toLocaleString()}</strong> • Net G/L:{' '}
        <strong style={{ color: data.totals.gainLoss >= 0 ? '#10b981' : '#ef4444' }}>
          ${data.totals.gainLoss.toLocaleString()}
        </strong>
      </div>
    </div>
  );
}
