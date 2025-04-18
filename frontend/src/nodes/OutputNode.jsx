import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function OutputNode({ data }) {
  const outputTypes = {
    display: 'Display',
    csv: 'Export CSV',
    json: 'Export JSON'
  };
  
  return (
    <div className="node output-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{background: '#555' }}
      />
      <div className="node-header">Output</div>
      <div className="node-content">
        <div>{outputTypes[data.outputType] || 'Display'}</div>
      </div>
    </div>
  );
}

export default memo(OutputNode);