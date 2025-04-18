
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

function InputNode({ data }) {

  return (
    <div className="node input-node">
      <div className="node-header">Input</div>
      <div className="node-content">
        <div>Source: {data.filePath}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#4CAF50' }}
      />
    </div>
  );
}

export default memo(InputNode);





