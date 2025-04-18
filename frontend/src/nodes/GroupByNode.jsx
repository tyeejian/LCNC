
// nodes/GroupByNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function GroupByNode({ data }) {
  const columns = data.columns && data.columns.length > 0 
    ? data.columns.join(', ') 
    : 'Not set';
    
  return (
    <div className="node groupby-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />
      <div className="node-header">Group By</div>
      <div className="node-content">
        <div>Columns: {columns}</div>
        {data.aggregationColumn && (
          <div>{data.aggregation}({data.aggregationColumn})</div>
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

export default memo(GroupByNode);