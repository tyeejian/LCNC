import React, {useState, useEffect} from 'react';
import {useReactFlow} from 'reactflow';
import axios from 'axios';
import { TextField, Chip, Autocomplete } from '@mui/material';


// Builds a map of nodeId -> [parentNodeId1, parentNodeId2]
function buildNodeInputs(edges) {
  const inputs = {};

  edges.forEach(({ source, target }) => {
    if (!inputs[target]) inputs[target] = [];
    inputs[target].push(source);
  });

  return inputs;
}



function findInputNode(currentNodeId, nodes, nodeInputs) {
  const visited = new Set();

  function dfs(nodeId) {
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    if (node.type === 'input') {
      return node;
    }

    const parents = nodeInputs[nodeId] || [];
    for (let parentId of parents) {
      const found = dfs(parentId);
      if (found) return found;
    }

    return null;
  }

  return dfs(currentNodeId);
}


function NodeSettings({ selectedNode, updateNodeData }) {

  const [files, setFiles] = useState([])
  const reactFlow = useReactFlow()
  const allNodes =  reactFlow.getNodes();
  const allEdges = reactFlow.getEdges();
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isColumnsFetched, setIsColumnsFetched] = useState(false);
  useEffect(() => {
    if (!selectedNode) return;
  
    // Only proceed for node types that need input columns
    const typesNeedingColumns = ['sort', 'filter', 'groupby'];
    if (!typesNeedingColumns.includes(selectedNode.type)) return;
  
    const nodeInputs = buildNodeInputs(allEdges);  // Make sure 'edges' is in scope
    const inputNode = findInputNode(selectedNode.id, allNodes, nodeInputs);  // Make sure 'nodes' is in scope
  
    if (inputNode?.data?.filePath) {
      axios.post('http://localhost:8080/api/get-columns', { filePath: inputNode.data.filePath })
        .then(
          res => {
            setAvailableColumns(res.data);
            setIsColumnsFetched(true);
          }
        )
        .catch(err => console.error('Error fetching columns', err));
    }
    
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/get-files')
      .then((res) => {
        setFiles(res.data.files)
        console.log(res.data.files)
      })
      .catch(err => console.error('Error fetching files', err));
  }, [])
  
  return (
    <div className="node-options">
      <h3>Node Settings</h3>
      
      {selectedNode.type === 'input' && (
        <div className="option-group">
          <label>Data Source</label>
          <select
            value={selectedNode.data.filePath}
            onChange={(e) => updateNodeData(selectedNode.id, { filePath: e.target.value })}
          >
            <option value="" disabled>Select files</option>
            {files.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      )}
      
      {selectedNode.type === 'filter' && (
        <>
          <div className="option-group">
            <label>Filter By Column</label>
            <select
              value={selectedNode.data.column}
              onChange={(e) => updateNodeData(selectedNode.id, { column: e.target.value })}
            >
              <option value="" disabled>Select column</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="option-group">
            <label>Condition</label>
            <select
              value={selectedNode.data.condition}
              onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
            >
              <option value="==">Equal to (==)</option>
              <option value="!=">Not equal to (!=)</option>
              <option value=">">Greater than ()</option>
              <option value=">=">Greater than or equal to (=)</option>
              <option value="<">Less than (&lt;)</option>
              <option value="<=">Less than or equal to (&lt;=)</option>
              <option value="contains">Contains</option>
            </select>
          </div>
          <div className="option-group">
            <label>Value</label>
            <input
              type="text"
              // value={selectedNode.data.value}
              onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
              placeholder="e.g., 30"
            />
          </div>
        </>
      )}
      
      {selectedNode.type === 'groupby' && (
        <>
          <div className="option-group">
            <label>Group By Columns</label>
            <Autocomplete
              multiple
              options={availableColumns}
              value={selectedNode.data.columns || []}
              onChange={(event, newValue) => {
                updateNodeData(selectedNode.id, { columns: newValue });
              }}

              isOptionEqualToValue={(option, value) => option === value}
              getOptionLabel={(option) => option}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select group by columns"
                />
              )}
            />
          </div>
          <div className="option-group">
            <label>Aggregation</label>
            <select
              value={selectedNode.data.aggregation}
              onChange={(e) => updateNodeData(selectedNode.id, { aggregation: e.target.value })}
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>
          </div>
          <div className="option-group">
            <label>Aggregation Column</label>
            <select
              value={selectedNode.data.aggregationColumn}
              onChange={(e) => updateNodeData(selectedNode.id, { aggregationColumn: e.target.value })}
            >
              <option value="" disabled>Select column</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </>
      )}
      
      {selectedNode.type === 'join' && (
        <>
          <div className="option-group">
            <label>Right Table Source Node ID</label>
            <input
              type="text"
              value={selectedNode.data.rightTableId}
              onChange={(e) => updateNodeData(selectedNode.id, { rightTableId: e.target.value })}
              placeholder="e.g., 2"
            />
          </div>
          <div className="option-group">
            <label>Left Column</label>
            <input
              type="text"
              value={selectedNode.data.leftColumn}
              onChange={(e) => updateNodeData(selectedNode.id, { leftColumn: e.target.value })}
              placeholder="e.g., user_id"
            />
          </div>
          <div className="option-group">
            <label>Right Column</label>
            <input
              type="text"
              value={selectedNode.data.rightColumn}
              onChange={(e) => updateNodeData(selectedNode.id, { rightColumn: e.target.value })}
              placeholder="e.g., id"
            />
          </div>
          <div className="option-group">
            <label>Join Type</label>
            <select
              value={selectedNode.data.joinType}
              onChange={(e) => updateNodeData(selectedNode.id, { joinType: e.target.value })}
            >
              <option value="inner">Inner Join</option>
              <option value="left">Left Join</option>
              <option value="right">Right Join</option>
              <option value="outer">Full Outer Join</option>
            </select>
          </div>
        </>
      )}
      
      {selectedNode.type === 'sort' && (
        <>
          <div className="option-group">
            <label>Sort By Column</label>
            <select
              value={selectedNode.data.column}
              onChange={(e) => updateNodeData(selectedNode.id, { column: e.target.value })}
            >
              <option value="" disabled>Select column</option>
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <div className="option-group">
            <label>Sort Order</label>
            <select
              value={selectedNode.data.order}
              onChange={(e) => updateNodeData(selectedNode.id, { order: e.target.value })}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </>
      )}
      
      {/* {selectedNode.type === 'merge' && (
        <div className="option-group">
          <label>Merge Type</label>
          <select
            value={selectedNode.data.mergeType}
            onChange={(e) => updateNodeData(selectedNode.id, { mergeType: e.target.value })}
          >
            <option value="concat">Concatenate</option>
            <option value="union">Union</option>
          </select>
        </div>
      )}
       */}
      {selectedNode.type === 'output' && (
        <div className="option-group">
          <label>Output Type</label>
          <select
            value={selectedNode.data.outputType}
            onChange={(e) => updateNodeData(selectedNode.id, { outputType: e.target.value })}
          >
            <option value="display">Display</option>
            <option value="csv">Export CSV</option>
            <option value="json">Export JSON</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default NodeSettings;