import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import axios from 'axios';

function GraphNode({ id, data }) {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [isLoading, setIsLoading] = useState(false);



  const reactFlow = useReactFlow();
  const allNodes = reactFlow.getNodes();
  const allEdges = reactFlow.getEdges();




  const serializeFlow = (nodes, edges) => ({
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle, type, label }) => ({
      id, source, target, sourceHandle, targetHandle, type, label,
    })),
    graphPrompt: prompt,
    id: {id}
  });
  

    const generateGraph = async () => {
        const payload = serializeFlow(allNodes, allEdges);
        // console.log('Graph node payload:', payload);
        data.setIsLoading(true);
        await axios.post('http://localhost:8080/api/execute-flow', payload)
          .then(res => {
            const code = res.data.code
            const resultData = res.data.data 
            data.setGraphResult({'resultData' : resultData, 'code': code});
          })
          .catch(err => console.error('Graph generation failed', err))
        data.setIsLoading(false);
      };

      
  return (
    <div className="node graph-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-content">
        <h4>Graph Generator</h4>
        <textarea
          placeholder="Describe your graph..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={{ width: '100%' }}
        />
        <button
          onClick={generateGraph}
          style={{ marginTop: '8px', padding: '6px 12px' }}
        >
            Generate Graph
        </button>
      </div>
    </div>
  );
}

export default GraphNode;
