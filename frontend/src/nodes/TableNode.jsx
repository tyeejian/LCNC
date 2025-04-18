import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import axios from 'axios';

function TableNode({ data, id }) {
  // console.log(data);

  const reactFlow = useReactFlow()
  const allNodes =  reactFlow.getNodes();
  const allEdges = reactFlow.getEdges();
  
  const serializeFlow = (nodes, edges) => ({
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle, type, label }) => ({
      id, source, target, sourceHandle, targetHandle, type, label,
    })),
    id: {id}
  });

  const executeFlow = () => {
    const payload = serializeFlow( allNodes, allEdges)
    console.log('Table node payload:', payload);
    // setIsLoading(true);
    
    axios.post('http://localhost:8080/api/execute-flow', payload)
      .then(response => {
        console.log(response)
        if (data?.onResult) {
          data.onResult(response.data)
        }
        // setResults(response.data);
        // setShowResults(true);
        // setIsLoading(false);
      })
      .catch(error => {
        console.error('Error executing flow:', error);
        // setIsLoading(false);
      });
    
  };
  
    return (
        <div className='node table-node'>
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                style={{Background: '#555' }}
            />
            <div className='node-content'>
                Table 
                <div>
                  <button 
                  onClick={executeFlow}
                  style={{
                    marginTop: '10px',
                    padding: '4px 10px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}>
                    Run
                  </button>
                </div>
            </div>
        </div>
    )
}

export default memo(TableNode);