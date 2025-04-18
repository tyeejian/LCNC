

// ResultsPanel.jsx
import React from 'react';

function ResultsPanel({ results, onClose }) {
  if (!results) return null;
  
  return (
    <div className="results-panel">
      <h3>
        Results
        <button className="close-button" onClick={onClose}>×</button>
      </h3>
      <pre>
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}

export default ResultsPanel;