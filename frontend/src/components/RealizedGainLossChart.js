import React, { useEffect, useState } from 'react';
import axios from 'axios';

// VIZ 1 — Realized gain/loss chart over tax year (SVG, no external charting lib).
export default function RealizedGainLossChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  const load = (y) => {
    setErr('');
    axios
      .get(`http://localhost:4000/api/custom-views/realized-gainloss?year=${y}`)
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  };

  useEffect(() => { load(year); }, [year]);

  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div>Loading realized P/L…</div>;

  const series = data.series;
  const maxAbs = Math.max(...series.map((s) => Math.max(s.realizedGains, Math.abs(s.realizedLosses))), 1);
  const W = 760;
  const H = 260;
  const BAR_W = (W - 60) / series.length / 2.4;
  const ZERO = H / 2 + 10;

  return (
    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }} data-testid="rgl-title">Realized Gain / Loss — {data.year}</h3>
        <div>
          <label style={{ marginRight: 8, fontSize: 13, opacity: 0.8 }}>Tax Year</label>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ padding: '6px 10px', borderRadius: 6 }}>
            {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <svg width={W} height={H + 40} style={{ display: 'block' }}>
        <line x1="40" x2={W - 10} y1={ZERO} y2={ZERO} stroke="rgba(255,255,255,0.3)" />
        {series.map((s, i) => {
          const cx = 50 + i * ((W - 60) / series.length);
          const hGain = (s.realizedGains / maxAbs) * (H / 2 - 10);
          const hLoss = (Math.abs(s.realizedLosses) / maxAbs) * (H / 2 - 10);
          return (
            <g key={s.month}>
              <rect x={cx - BAR_W - 1} y={ZERO - hGain} width={BAR_W} height={hGain} fill="#10b981">
                <title>{s.month}: +${s.realizedGains.toLocaleString()}</title>
              </rect>
              <rect x={cx + 1} y={ZERO} width={BAR_W} height={hLoss} fill="#ef4444">
                <title>{s.month}: ${s.realizedLosses.toLocaleString()}</title>
              </rect>
              <text x={cx} y={H + 25} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)">{s.month}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 13 }}>
        <span>Total Gains: <strong style={{ color: '#10b981' }}>${data.summary.totalGains.toLocaleString()}</strong></span>
        <span>Total Losses: <strong style={{ color: '#ef4444' }}>${data.summary.totalLosses.toLocaleString()}</strong></span>
        <span>Net: <strong>${data.summary.net.toLocaleString()}</strong></span>
      </div>
    </div>
  );
}
