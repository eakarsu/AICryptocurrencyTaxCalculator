import React from 'react';
import AIResultView from '../pages/AIResultView';

export default function AIResponseDisplay({ content, model, usage, title }) {
  if (content === null || content === undefined || content === '') return null;
  return (
    <AIResultView
      response={content}
      model={model}
      tokens={usage}
      title={title || 'AI analysis'}
      label="AI analysis"
    />
  );
}
