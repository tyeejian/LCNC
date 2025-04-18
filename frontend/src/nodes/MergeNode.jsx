import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function MergeNode({ data }) {
  return (
    <div className="node merge-node">
      <Handle
        type="target"
        position={Position.Top}
        id="input-1"
        style={{ top: 0, background: '#555' }}
      />
      <div className="node-header">Merge</div>
      <div className="node-content">
        <div>{data.mergeType === 'concat' ? 'Concatenate' : 'Union'}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ bottom: 0, background: '#4CAF50' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input-2"
        style={{ left: 0, background: '#555' }}
      />
    </div>
  );
}

export default memo(MergeNode);