
// nodes/JoinNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function JoinNode({ data }) {
  return (
    <div className="node join-node">
      <Handle
        type="target"
        position={Position.Left}
        id="left-table"
        style={{ top: '20px', background: '#555' }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="right-table"
        style={{ top: '60px',background: '#555' }}
      />
      <div className="node-header">Join</div>
      <div className="node-content">
        {(data.leftColumn && data.rightColumn) ? (
          <div>
            <div>{data.joinType} join</div>
            <div>on {data.leftColumn} = {data.rightColumn}</div>
          </div>
        ) : (
          <div>Configure join...</div>
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

export default memo(JoinNode);