import React, { useEffect, useState } from 'react';
import axios from 'axios';

// VIZ 2 — Tax bracket heatmap (bracket x asset).
export default function TaxBracketHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/custom-views/bracket-heatmap')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div>Loading heatmap…</div>;

  const max = Math.max(...data.matrix.flat().map((c) => c.taxOwed), 1);
  const color = (v) => {
    const t = v / max;
    const r = Math.round(40 + 215 * t);
    const g = Math.round(80 * (1 - t) + 40);
    return `rgb(${r}, ${g}, 80)`;
  };

  return (
    <div className="card" style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <h3 style={{ margin: '0 0 16px' }} data-testid="heatmap-title">Tax Bracket Heatmap (Bracket × Asset)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 12, opacity: 0.7 }}>Bracket \ Asset</th>
              {data.assets.map((a) => (
                <th key={a} style={{ padding: '6px 10px', fontSize: 12 }}>{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, ri) => (
              <tr key={data.brackets[ri].name}>
                <td style={{ padding: '6px 10px', fontSize: 12, opacity: 0.85 }}>{data.brackets[ri].name}</td>
                {row.map((cell) => (
                  <td
                    key={`${cell.bracket}-${cell.asset}`}
                    title={`${cell.asset} @ ${cell.bracket}: $${cell.taxOwed.toLocaleString()} owed on $${cell.gain.toLocaleString()} gain`}
                    style={{
                      background: color(cell.taxOwed),
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: 6,
                      textAlign: 'center',
                      fontSize: 12,
                      minWidth: 72,
                      fontWeight: 600,
                    }}
                  >
                    ${(cell.taxOwed / 1000).toFixed(1)}k
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
        Cell value = estimated US federal tax owed for a single asset's realized gain at that marginal bracket.
      </div>
    </div>
  );
}
