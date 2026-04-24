import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import DetailView from '../components/DetailView';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function CrudPage({ title, subtitle, api, columns, detailFields, formFields, aiButtonLabel, aiAction }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getAll();
      setItems(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [api]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRowClick = (row) => {
    setSelected(row);
    setAiResult(null);
  };

  const handleNew = () => {
    setEditItem(null);
    const defaults = {};
    formFields.forEach(f => { defaults[f.key] = f.default || ''; });
    setFormData(defaults);
    setShowForm(true);
  };

  const handleEdit = () => {
    setEditItem(selected);
    const data = {};
    formFields.forEach(f => { data[f.key] = selected[f.key] || ''; });
    setFormData(data);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(selected.id);
      setSelected(null);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.update(editItem.id, formData);
      } else {
        await api.create(formData);
      }
      setShowForm(false);
      setSelected(null);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleAiAnalyze = async () => {
    setAiLoading(true);
    try {
      const res = await aiAction();
      setAiResult(res.data);
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  const handleItemAiAnalyze = async () => {
    if (!aiAction) return;
    setAiLoading(true);
    try {
      const res = await aiAction(selected);
      setAiResult(res.data);
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleNew}>+ New Item</button>
          {aiAction && (
            <button className="btn btn-ai" onClick={handleAiAnalyze} disabled={aiLoading}>
              {aiLoading ? 'AI Analyzing...' : aiButtonLabel || 'AI Analyze All'}
            </button>
          )}
        </div>
      </div>

      {aiResult && (
        <AIResponseDisplay
          content={aiResult.analysis || aiResult.report}
          model={aiResult.model}
          usage={aiResult.usage}
          title={aiButtonLabel || 'AI Analysis'}
        />
      )}

      {selected ? (
        <>
          <DetailView
            title={title}
            fields={detailFields}
            data={selected}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setSelected(null)}
            onAiAnalyze={aiAction ? handleItemAiAnalyze : undefined}
            aiLoading={aiLoading}
          />
        </>
      ) : (
        <DataTable
          title={title}
          columns={columns}
          data={items}
          onRowClick={handleRowClick}
          actionButton={<button className="btn btn-primary btn-sm" onClick={handleNew}>+ Add</button>}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? `Edit ${title}` : `New ${title}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        {formFields.map((field) => (
          <div key={field.key} className="form-group">
            <label>{field.label}</label>
            {field.type === 'select' ? (
              <select value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}>
                <option value="">Select...</option>
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea rows={3} value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} />
            ) : (
              <input
                type={field.type || 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                step={field.type === 'number' ? 'any' : undefined}
              />
            )}
          </div>
        ))}
      </Modal>
    </div>
  );
}
