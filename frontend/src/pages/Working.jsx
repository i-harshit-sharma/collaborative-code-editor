// import React, { useEffect, useRef, useState } from 'react';
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import io from 'socket.io-client';
// import { v4 as uuidv4 } from 'uuid';
// import 'xterm/css/xterm.css';
// import { useAuth } from '@clerk/clerk-react';

// export default function Working() {
//   const containerId = '2441daa51c8ca0e2b143be0851e0b2a0e3270af03f48f65dcbe3b7926593ff9a';
//   const { getToken } = useAuth();
//   const socketRef = useRef();
//   const terminalsRef = useRef({}); // Map termId -> { term, fit, containerRef }

//   const [termIds, setTermIds] = useState([]);
//   const [selectedTerminal, setSelectedTerminal] = useState(null);

//   // Function to create a new terminal
//   const addTerminal = async () => {
//     const termId = uuidv4();
//     const containerRef = React.createRef();
//     const fit = new FitAddon();
//     const term = new Terminal({ cursorBlink: true, fontSize: 14 });
//     term.loadAddon(fit);

//     terminalsRef.current[termId] = { term, fit, containerRef };
//     setTermIds(ids => [...ids, termId]);
//     setSelectedTerminal(termId);

//     // Wait for DOM
//     setTimeout(async () => {
//       const { term, fit, containerRef } = terminalsRef.current[termId];
//       term.open(containerRef.current);
//       fit.fit();

//       const token = await getToken();
//       socketRef.current.emit('sendToken', { token, containerId, terminalId: termId });

//       term.onData(data => {
//         socketRef.current.emit('input', { terminalId: termId, data });
//       });

//       window.addEventListener('resize', () => fit.fit());
//     }, 0);
//   };

//   // Setup socket once, and create initial terminal
//   useEffect(() => {
//     socketRef.current = io('http://localhost:4000');

//     socketRef.current.on('output', ({ terminalId, data }) => {
//       const entry = terminalsRef.current[terminalId];
//       if (entry) entry.term.write(data);
//     });

//     // Create one terminal on mount
//     addTerminal();

//     return () => socketRef.current.disconnect();
//   }, []);

//   // Close and remove terminal
//   const closeTerminal = id => {
//     const entry = terminalsRef.current[id];
//     if (entry) {
//       entry.term.dispose();
//       delete terminalsRef.current[id];
//       setTermIds(ids => ids.filter(tid => tid !== id));
//       socketRef.current.emit('closeTerminal', { terminalId: id });
//       if (selectedTerminal === id) {
//         setSelectedTerminal(null);
//       }
//     }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {/* Controls */}
//       <div className="flex space-x-2 p-2 bg-gray-800 text-white">
//         <button onClick={addTerminal} className="px-3 py-1 bg-green-600 rounded">
//           + New Terminal
//         </button>

//         {termIds.map(id => (
//           <div key={id} className="flex items-center space-x-1">
//             <button
//               onClick={() => setSelectedTerminal(id)}
//               className={`px-2 py-1 rounded ${selectedTerminal === id ? 'bg-blue-600' : 'bg-gray-600'}`}
//             >
//               {id.slice(0, 4)}
//             </button>
//             <button
//               onClick={() => closeTerminal(id)}
//               className="px-2 py-1 bg-red-600 rounded"
//             >
//               ×
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Only show the selected terminal */}
//       <div className="flex-1 relative bg-black overflow-hidden h-64">
//         {termIds.map(id => (
//           <div
//             key={id}
//             ref={terminalsRef.current[id].containerRef}
//             className={`inset-0 h-56 w-full ${selectedTerminal === id ? '' : 'hidden h-0 w-0 absolute bottom-0 right-0'}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import 'xterm/css/xterm.css';
import { useAuth } from '@clerk/clerk-react';

export default function Working() {
  const containerId = '2441daa51c8ca0e2b143be0851e0b2a0e3270af03f48f65dcbe3b7926593ff9a';
  const { getToken } = useAuth();
  const socketRef = useRef();
  const terminalsRef = useRef({}); // Map termId -> { term, fit, containerRef }
  const selectedRef = useRef(null);

  const [termIds, setTermIds] = useState([]);
  const [selectedTerminal, setSelectedTerminal] = useState(null);

  // Keep a mutable ref of the latest selected terminal
  useEffect(() => {
    selectedRef.current = selectedTerminal;
  }, [selectedTerminal]);

  // Function to create a new terminal
  const addTerminal = async () => {
    const termId = uuidv4();
    const containerRef = React.createRef();
    const fit = new FitAddon();
    const term = new Terminal({ cursorBlink: true, fontSize: 14 });
    term.loadAddon(fit);

    terminalsRef.current[termId] = { term, fit, containerRef };
    setTermIds(ids => [...ids, termId]);
    setSelectedTerminal(termId);

    // Wait for DOM to render
    setTimeout(async () => {
      const entry = terminalsRef.current[termId];
      const { term, fit, containerRef } = entry;
      term.open(containerRef.current);
      fit.fit();

      const token = await getToken();
      socketRef.current.emit('sendToken', { token, containerId, terminalId: termId });

      // Only emit input for the currently selected terminal
      term.onData(data => {
        if (selectedRef.current === termId) {
          socketRef.current.emit('input', { terminalId: termId, data });
        }
      });

      // Resize handler for this terminal
      const onResize = () => fit.fit();
      window.addEventListener('resize', onResize);

      // Clean up when terminal is closed
      entry.dispose = () => window.removeEventListener('resize', onResize);
    }, 0);
  };

  // Setup socket once, and create initial terminal
  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    socketRef.current.on('output', ({ terminalId, data }) => {
      const entry = terminalsRef.current[terminalId];
      if (entry) entry.term.write(data);
    });

    // Create one terminal on mount
    addTerminal();

    return () => {
      socketRef.current.disconnect();
      // Dispose all resize listeners
      Object.values(terminalsRef.current).forEach(entry => entry.dispose && entry.dispose());
    };
  }, []);

  // Close and remove terminal
  const closeTerminal = id => {
    const entry = terminalsRef.current[id];
    if (entry) {
      entry.dispose && entry.dispose();
      entry.term.dispose();
      delete terminalsRef.current[id];
      setTermIds(ids => ids.filter(tid => tid !== id));
      socketRef.current.emit('closeTerminal', { terminalId: id });
      if (selectedTerminal === id) {
        setSelectedTerminal(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex space-x-2 p-2 bg-gray-800 text-white">
        <button onClick={addTerminal} className="px-3 py-1 bg-green-600 rounded">
          + New Terminal
        </button>

        {termIds.map(id => (
          <div key={id} className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedTerminal(id)}
              className={`px-2 py-1 rounded ${selectedTerminal === id ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              {id.slice(0, 4)}
            </button>
            <button
              onClick={() => closeTerminal(id)}
              className="px-2 py-1 bg-red-600 rounded"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Only show the selected terminal */}
      <div className="flex-1 relative bg-black overflow-hidden h-64">
        {termIds.map(id => (
          <div
            key={id}
            ref={terminalsRef.current[id].containerRef}
            className={`inset-0 h-56 w-full ${selectedTerminal === id ? '' : 'hidden h-0 w-0 absolute bottom-0 right-0'}`}
          />
        ))}
      </div>
    </div>
  );
}
