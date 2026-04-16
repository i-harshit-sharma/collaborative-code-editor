// import React, { useEffect, useRef, useState } from 'react';
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import io from 'socket.io-client';
// import { v4 as uuidv4 } from 'uuid';
// import 'xterm/css/xterm.css';
// import { useAuth } from '@clerk/clerk-react';

// export default function TerminalPane({containerId}) {
// //   const containerId = '2441daa51c8ca0e2b143be0851e0b2a0e3270af03f48f65dcbe3b7926593ff9a';
// console.log(containerId)
//   const { getToken } = useAuth();
//   const socketRef = useRef();
//   const terminalsRef = useRef({}); // Map termId -> { term, fit, containerRef }

//   const [termIds, setTermIds] = useState([]);
//   const [selectedTerminal, setSelectedTerminal] = useState(null);

//   // Setup socket once
//   useEffect(() => {
//     socketRef.current = io('http://localhost:4000');

//     socketRef.current.on('output', ({ terminalId, data }) => {
//       console.log('output', terminalId, data)
//       const entry = terminalsRef.current[terminalId];
//       if (entry) entry.term.write(data);
//     });

//     return () => socketRef.current.disconnect();
//   }, []);

//   // Create a new terminal
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
//         console.log('onData', data)
//         socketRef.current.emit('input', { terminalId: termId, data });
//       });

//       window.addEventListener('resize', () => fit.fit());
//     }, 0);
//   };

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
//         {selectedTerminal}
//         {termIds.map(id => (
//           <>
//           {/* {id} */}
//           <div key={id} ref={terminalsRef.current[id].containerRef} className={` inset-0 h-56 w-full ${selectedTerminal === id ? '':'hidden h-0 w-0 absolute bottom-0 right-0'}`} />
//           </>
//         ))}
//         {/* {selectedTerminal && terminalsRef.current[selectedTerminal] && (
//           <div
//             ref={terminalsRef.current[selectedTerminal].containerRef}
//             className="  w-full h-64"
//           />
//         )} */}
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useRef, useState } from 'react';
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import io from 'socket.io-client';
// import { v4 as uuidv4 } from 'uuid';
// import 'xterm/css/xterm.css';
// import { useAuth } from '@clerk/clerk-react';

// export default function TerminalManager({ containerId }) {
//   const socketRef = useRef();
//   const terminalsRef = useRef({}); // Map of terminalId -> { term, fit, containerRef }
//   const [termIds, setTermIds] = useState([]);
//   const {getToken} = useAuth();

//   // Initialize socket once
//   useEffect(() => {
//     socketRef.current = io('http://localhost:4000');

//     socketRef.current.on('output', ({ terminalId, data }) => {
//       const entry = terminalsRef.current[terminalId];
//       if (entry) entry.term.write(data);
//     });
//     addTerminal()
//     return () => socketRef.current.disconnect();
//   }, []);

//   const addTerminal = async () => {
//     const termId = uuidv4();
//     const containerRef = React.createRef();
//     const fit = new FitAddon();
//     const term = new Terminal({ cursorBlink: true, fontSize: 14 });
//     term.loadAddon(fit);

//     terminalsRef.current[termId] = { term, fit, containerRef };
//     setTermIds(ids => [...ids, termId]);

//     // Delay until DOM node mounts
//     setTimeout(async () => {
//       const { term, fit, containerRef } = terminalsRef.current[termId];
//       term.open(containerRef.current);
//       fit.fit();

//       const token = await getToken();
//       socketRef.current.emit('sendToken', { token, containerId, terminalId: termId });

//       term.onData(data => {
//         socketRef.current.emit('input', { terminalId: termId, data });
//       });

//       // Optional: handle window resize for this terminal
//       window.addEventListener('resize', () => fit.fit());
//     }, 0);
//   };

//   const closeTerminal = id => {
//     const entry = terminalsRef.current[id];
//     if (entry) {
//       entry.term.dispose();
//       delete terminalsRef.current[id];
//       setTermIds(ids => ids.filter(tid => tid !== id));
//       socketRef.current.emit('closeTerminal', { terminalId: id });
//     }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       <div className="flex space-x-2 p-2 bg-gray-800">
//         <button onClick={addTerminal} className="px-3 py-1 bg-green-600 rounded">+ New Terminal</button>
//         {termIds.map(id => (
//           <button key={id} onClick={() => closeTerminal(id)} className="px-2 py-1 bg-red-600 rounded">
//             × {id.slice(0, 4)}
//           </button>
//         ))}
//       </div>
//       <div className="flex-1 relative">
//         {termIds.map(id => (
//           <div key={id} ref={terminalsRef.current[id].containerRef} className="absolute inset-0" />
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

export default function TerminalManager({ containerId }) {
  const socketRef = useRef();
  const terminalsRef = useRef({});
  const [termIds, setTermIds] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    socketRef.current.on('output', ({ terminalId, data }) => {
      const entry = terminalsRef.current[terminalId];
      if (entry) entry.term.write(data);
    });

    addTerminal();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const addTerminal = async () => {
    const termId = uuidv4();
    const containerRef = React.createRef();
    const fit = new FitAddon();
    const term = new Terminal({ cursorBlink: true, fontSize: 14 });

    term.loadAddon(fit);
    terminalsRef.current[termId] = { term, fit, containerRef };

    setTermIds(prev => [...prev, termId]);

    setTimeout(async () => {
      const { term, fit, containerRef } = terminalsRef.current[termId];
      term.open(containerRef.current);
      fit.fit();

      const token = await getToken();
      socketRef.current.emit('sendToken', { token, containerId, terminalId: termId });

      // Register onData once
      term.onData(data => {
        socketRef.current.emit('input', { terminalId: termId, data });
      });

      window.addEventListener('resize', () => fit.fit());
    }, 0);
  };

  const closeTerminal = id => {
    const entry = terminalsRef.current[id];
    if (entry) {
      entry.term.dispose();
      delete terminalsRef.current[id];
      setTermIds(prev => prev.filter(tid => tid !== id));
      socketRef.current.emit('closeTerminal', { terminalId: id });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex space-x-2 p-2 bg-gray-800">
        <button onClick={addTerminal} className="px-3 py-1 bg-green-600 rounded">+ New Terminal</button>
        {termIds.map(id => (
          <button key={id} onClick={() => closeTerminal(id)} className="px-2 py-1 bg-red-600 rounded">
            × {id.slice(0, 4)}
          </button>
        ))}
      </div>
      <div className="flex-1 relative">
        {termIds.map(id => (
          <div
            key={id}
            ref={terminalsRef.current[id]?.containerRef}
            className="absolute inset-0"
          />
        ))}
      </div>
    </div>
  );
}
