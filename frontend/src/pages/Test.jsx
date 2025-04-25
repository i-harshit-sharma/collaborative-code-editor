import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000');

export default function Test() {
  const { roomId } = useParams();
  const [code, setCode] = useState('// Start coding...');
  const [output, setOutput] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('init-code', setCode);
    socket.on('code-update', (updatedCode) => {
      if (updatedCode !== editorRef.current?.getValue()) {
        setCode(updatedCode);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomId, code: value });
  };

  const runCode = async () => {
    try {
      const response = await axios.post('http://localhost:4000/run', {
        language: 'python3', // You can allow user selection
        code,
      });
      setOutput(response.data.run.output);
    } catch (err) {
      setOutput('Execution error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <h1 className="text-lg font-bold">Room ID: {roomId}</h1>
        <button onClick={runCode} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Run Code</button>
      </div>
      <div className="flex flex-1">
        <div className="w-2/3 border-r border-gray-700">
          <Editor
            height="100%"
            defaultLanguage="python"
            defaultValue={code}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            onMount={(editor) => (editorRef.current = editor)}
          />
        </div>
        <div className="w-1/3 p-4 bg-black">
          <h2 className="text-xl mb-2">Output:</h2>
          <pre className="bg-gray-800 p-2 rounded h-full overflow-y-auto">{output}</pre>
        </div>
      </div>
    </div>
  );
}
