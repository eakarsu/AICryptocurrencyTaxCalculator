import React from 'react';
import RealizedGainLossChart from '../components/RealizedGainLossChart';
import TaxBracketHeatmap from '../components/TaxBracketHeatmap';
import Form8949PDF from '../components/Form8949PDF';
import TaxRulesEditor from '../components/TaxRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0 }} data-testid="custom-views-title">Tax Views</h1>
        <p style={{ opacity: 0.75, marginTop: 6 }}>
          Custom views: realized P/L over the tax year, bracket × asset heatmap, Form 8949 export, and editable jurisdiction rules.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <RealizedGainLossChart />
        <TaxBracketHeatmap />
        <Form8949PDF />
        <TaxRulesEditor />
      </div>
    </div>
  );
}
