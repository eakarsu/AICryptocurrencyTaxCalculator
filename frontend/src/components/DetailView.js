import React from 'react';

export default function DetailView({ title, fields, data, onEdit, onDelete, onClose, onAiAnalyze, aiLoading }) {
  if (!data) return null;

  return (
    <div className="detail-view">
      <div className="detail-header">
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800 }}>{title}</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>ID: {data.id}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onAiAnalyze && (
            <button className="btn btn-ai btn-sm" onClick={onAiAnalyze} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze'}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onEdit}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
      <div className="detail-grid">
        {fields.map((field) => (
          <div key={field.key} className="detail-field">
            <div className="label">{field.label}</div>
            <div className="value">
              {field.render ? field.render(data[field.key], data) : (data[field.key] ?? 'N/A')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
