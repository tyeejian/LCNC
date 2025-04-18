import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function SortNode({ data }) {
  return (
    <div className="node sort-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />
      <div className="node-header">Sort</div>
      <div className="node-content">
        {data.column ? (
          <div>Sort by {data.column} ({data.order})</div>
        ) : (
          <div>Configure sort...</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ bottom: 0, background: '#4CAF50' }}
      />
    </div>
  );
}

export default memo(SortNode);