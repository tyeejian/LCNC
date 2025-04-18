// Sidebar.jsx
import React, {useState} from 'react';
import { usePython } from 'react-py'
import { Input } from '@mui/material';
import axios from 'axios';


import { PythonProvider } from 'react-py'


function Codeblock() {
  const [input, setInput] = useState('')

  // Use the usePython hook to run code and access both stdout and stderr
  const { runPython, stdout, stderr, isLoading, isRunning } = usePython()

  return (
    <>
      {isLoading ? <p>Loading...</p> : <p>Ready!</p>}
      <form>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your code here"
        />
        <input
          type="submit"
          value={!isRunning ? 'Run' : 'Running...'}
          disabled={isLoading || isRunning}
          onClick={(e) => {
            e.preventDefault()
            runPython(input)
          }}
        />
      </form>
      <p>Output</p>
      <pre>
        <code>{stdout}</code>
      </pre>
      <p>Error</p>
      <pre>
        <code>{stderr}</code>
      </pre>
    </>
  )
}

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:8080/api/upload', formData)
      .then((res) => {
        console.log(res)
      })
      .catch(err => console.error('Failed to upload file: ', err))
  };

  return (
    <div className="sidebar">
      <h3>Nodes</h3>
      <div class='upload-box'>
        <input type='file' id='image-file-input' accept='.csv'
          onChange={handleFileUpload}/>
        <span> Upload a file </span>
        <span id="csv-only"> CSV Only </span>
      </div>

      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'input')} 
        draggable
      >
        Input
      </div>
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'filter')} 
        draggable
      >
        Filter
      </div>
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'groupby')} 
        draggable
      >
        Group By
      </div>
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'join')} 
        draggable
      >
        Join
      </div>
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'sort')} 
        draggable
      >
        Sort
      </div>
      {/* <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'merge')} 
        draggable
      >
        Merge
      </div> */}
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'output')} 
        draggable
      >
        Output
      </div>
      <div 
        className="dndnode" 
        onDragStart={(event) => onDragStart(event, 'table')} 
        draggable
      >
        Table
      </div>
      <div
        className='dndnode'
        onDragStart={(event) => onDragStart(event, 'graph')}
        draggable
        >
          Graph
        </div>
    </div>
  );
}

export default Sidebar;