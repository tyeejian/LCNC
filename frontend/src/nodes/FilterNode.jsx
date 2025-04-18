import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function FilterNode({ data }) {
  return (
    <div className="node filter-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />
      <div className="node-header">Filter</div>
      <div className="node-content">
        {data.column && <div>{data.column} {data.condition} {data.value}</div>}
        {!data.column && <div>Configure filter...</div>}
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

export default memo(FilterNode);