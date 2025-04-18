import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  MiniMap,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { DataGrid } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import {Resizable} from "re-resizable";


import Sidebar from './components/Sidebar';
import NodeSettings from './components/NodeSettings';
import Header from './components/Header';
import './App.css';
// Node types
import InputNode from './nodes/InputNode';
import FilterNode from './nodes/FilterNode';
import GroupByNode from './nodes/GroupByNode';
import JoinNode from './nodes/JoinNode';
import SortNode from './nodes/SortNode';
import MergeNode from './nodes/MergeNode';
import OutputNode from './nodes/OutputNode';
import TableNode from './nodes/TableNode';
import GraphNode from './nodes/GraphNode';



const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input', filePath: 'sample_data.csv' },
    position: { x: 250, y: 100 },
  },
];

const nodeTypes = {
  input: InputNode,
  filter: FilterNode,
  groupby: GroupByNode,
  join: JoinNode,
  sort: SortNode,
  output: OutputNode,
  table: TableNode,
  graph: GraphNode
};

function App() {
  const [heightInPixels, setHeightInPixels] = useState(window.innerHeight / 2); // Initialize with half of the window height

  const t_Height = `${heightInPixels}px`; // Use pixel value directly
  const b_Height = `calc(100vh - ${t_Height})`;
  const graphRef = useRef(null);

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  const [selectedNode, setSelectedNode] = useState(null);
  // const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGraph, setHasGraph] = useState(false);
  const [graphCode, setGraphCode] = useState(null);

  const handleGraphResult = useCallback((data)=> {
    setHasGraph(true);
    setGraphCode(data.code);
    setResults(data.resultData)
    // console.log(code)
    // console.log(resultData)
    // console.log(data.code)
  }, [])

  const handleResult = useCallback((data) => {
    // toggle back table format
    setHasGraph(false);
    setResults(data);
  }, [])

  const handleLoading = useCallback((data) => {
    setIsLoading(data);
  }, [])

  useEffect(() => {
    if (results) {
      console.log('Results updated:', typeof(results));
    }

    if (hasGraph && graphCode && graphRef.current) {
      // Clear previous graph
      graphRef.current.innerHTML = '';
  
      const wrapper = document.createElement('div');
      wrapper.id = 'custom-graph';
      graphRef.current.appendChild(wrapper);
  
      // Load D3
      const d3Script = document.createElement('script');
      d3Script.src = 'https://d3js.org/d3.v7.min.js';
      d3Script.onload = () => {
        window.graphData = results;
        const codeScript = document.createElement('script');
        codeScript.innerHTML = `
          (function() {
            const container = document.getElementById('custom-graph');
            if (!container) return;
            const results = window.graphData;
            ${graphCode}
          })()
        `;
        graphRef.current.appendChild(codeScript);
      };
  
      graphRef.current.appendChild(d3Script);
    }
  }, [results, graphCode, hasGraph]);


  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
      style: { strokeWidth: 2 }
    }, eds));


  }, [setEdges]);
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNodeId = `${Date.now()}`;
      let newNodeData = { label: type.charAt(0).toUpperCase() + type.slice(1) };
      
      // Add default properties based on node type
      switch(type) {
        case 'input':
          newNodeData.filePath = '';
          break;
        case 'filter':
          newNodeData.column = '';
          newNodeData.condition = '==';
          newNodeData.value = '';
          break;
        case 'groupby':
          newNodeData.columns = [];
          newNodeData.aggregation = 'sum';
          newNodeData.aggregationColumn = '';
          break;
        case 'join':
          newNodeData.rightTableId = '';
          newNodeData.leftColumn = '';
          newNodeData.rightColumn = '';
          newNodeData.joinType = 'inner';
          break;
        case 'sort':
          newNodeData.column = '';
          newNodeData.order = 'asc';
          break;
        case 'output':
          newNodeData.outputType = 'display';
          break;
        case 'table':
          newNodeData.label = 'table';
          newNodeData.onResult = handleResult;
          break;
        case 'graph':
          newNodeData.prompt = '';
          newNodeData.setGraphResult = handleGraphResult;
          newNodeData.setIsLoading = handleLoading;
          break;
        default:
          break;
      }

      let newNode = {
        id: newNodeId,
        type,
        position,
        data: newNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes, handleGraphResult, handleResult]
  );
  
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };
  
  const onPaneClick = () => {
    setSelectedNode(null);
  };
  
  const updateNodeData = (id, newData) => {
    console.log('id is :', id)
    console.log('nodedata is: ', newData)
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="app-container">
      <Header/>
      
      <div className="content">
            
        <Sidebar />
          <ReactFlowProvider>
            <div className="flowchart-area" ref={reactFlowWrapper}>
              <Box sx={{height: t_Height}}>
                <Resizable
                  size={{ height: t_Height }}
                  onResizeStop={(e, direction, refToResizable, d) => {
                    setHeightInPixels(refToResizable.offsetHeight); // Functional update based on previous height
                  }}
                  minHeight="30vh"
                  maxHeight="70vh"
                  enable={{
                    top: false,
                    right: false,
                    bottom: true,
                    left: false,
                    topRight: false,
                    bottomRight: false,
                    bottomLeft: false,
                    topLeft: false
                  }}
                  handleComponent={{
                    bottom: <div style={{ height: '10px', background: '#ccc' }} />
                  }}
                >

                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitView
                  >
                    <Background />
                    <Controls />
                    <MiniMap />
                  </ReactFlow>
                
                  {selectedNode && (
                    <NodeSettings 
                      selectedNode={selectedNode} 
                      updateNodeData={updateNodeData} 
                    />
                  )}
                </Resizable>
              </Box>

              <Box sx={{ height: b_Height, padding: 2, backgroundColor: '#f5f5f5'}}>
                {(!hasGraph && results && Array.isArray(results) && results.length > 0) ? 
                  (<>
                    <h3 style={{ marginBottom: '10px' }}>Execution Results</h3>
                    <DataGrid
                      rows={results.map((row, index) => ({ id: index, ...row }))}
                      columns={Object.keys(results[0]).map((key) => ({
                        field: key,
                        headerName: key.charAt(0).toUpperCase() + key.slice(1),
                        flex: 1,
                      }))}
                      pagination
                      pageSize={10}
                      rowsPerPageOptions={[5, 10, 20]}
                      checkboxSelection={false}
                      disableSelectionOnClick
                    />
                  </>)
                  
                : ((!hasGraph && !results) ? <p style={{ textAlign: 'center'}}>No active output</p> 
                : 

                  isLoading ? (<CircularProgress/>):  (<div ref={graphRef} id="d3-graph-container" style={{
                      width: '100%',      
                      height: 'justify',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',}} /> )
                  )} 

              </Box>
              
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;