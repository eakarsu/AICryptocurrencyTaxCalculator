import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIResponseDisplay({ content, model, usage, title }) {
  if (!content) return null;

  return (
    <div className="ai-response">
      <div className="ai-response-header">
        <span className="ai-badge">AI Analysis</span>
        {title && <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>}
        {model && <span className="ai-model">Model: {model}</span>}
      </div>
      <div className="ai-response-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      {usage && (
        <div className="ai-response-footer">
          <span>Tokens: {usage.total_tokens || 'N/A'}</span>
          <span>Prompt: {usage.prompt_tokens || 'N/A'}</span>
          <span>Completion: {usage.completion_tokens || 'N/A'}</span>
        </div>
      )}
    </div>
  );
}
