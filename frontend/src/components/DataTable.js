import React from 'react';

export default function DataTable({ title, columns, data, onRowClick, actionButton }) {
  return (
    <div className="table-container">
      <div className="table-header">
        <h3>{title} ({data.length})</h3>
        {actionButton}
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No data available</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} onClick={() => onRowClick && onRowClick(row)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
