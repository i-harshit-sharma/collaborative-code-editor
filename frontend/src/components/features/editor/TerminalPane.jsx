import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { v4 as uuidv4 } from 'uuid';
import 'xterm/css/xterm.css';
import { useAuth } from '@clerk/clerk-react';

export default function TerminalPane({ containerId, socket }) {
  const terminalsRef = useRef({});
  const [termIds, setTermIds] = useState([]);
  const [activeTermId, setActiveTermId] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleOutput = ({ terminalId, data }) => {
      const entry = terminalsRef.current[terminalId];
      if (entry) entry.term.write(data);
    };

    socket.on('output', handleOutput);

    // Initial terminal
    if (termIds.length === 0) {
      addTerminal();
    }

    return () => {
      socket.off('output', handleOutput);
      // Clean up all terminals on unmount
      Object.values(terminalsRef.current).forEach(entry => {
        if (entry.handleResize) window.removeEventListener('resize', entry.handleResize);
        entry.term.dispose();
      });
    };
  }, [socket]);

  // Refocus terminal when activeTermId changes
  useEffect(() => {
    if (activeTermId && terminalsRef.current[activeTermId]) {
      setTimeout(() => {
        terminalsRef.current[activeTermId].term.focus();
        terminalsRef.current[activeTermId].fit.fit();
      }, 50);
    }
  }, [activeTermId]);

  const addTerminal = async () => {
    const termId = uuidv4();
    const containerRef = React.createRef();
    const fit = new FitAddon();
    const term = new Terminal({ 
      cursorBlink: true, 
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      }
    });

    term.loadAddon(fit);
    terminalsRef.current[termId] = { term, fit, containerRef };

    setTermIds(prev => [...prev, termId]);
    setActiveTermId(termId);

    // Delay until component re-renders and ref is available
    setTimeout(async () => {
      const entry = terminalsRef.current[termId];
      if (!entry || !entry.containerRef.current) return;
      
      entry.term.open(entry.containerRef.current);
      entry.fit.fit();
      entry.term.focus();

      const token = await getToken();
      socket.emit('sendToken', { token, containerId, terminalId: termId });

      entry.term.onData(data => {
        socket.emit('input', { terminalId: termId, data });
      });

      entry.term.onResize(({ cols, rows }) => {
        socket.emit('resize', { terminalId: termId, cols, rows });
      });

      const handleResize = () => entry.fit.fit();
      window.addEventListener('resize', handleResize);
      entry.handleResize = handleResize;
    }, 100);
  };

  const closeTerminal = (e, id) => {
    e.stopPropagation(); // Don't trigger tab activation when clicking close
    const entry = terminalsRef.current[id];
    if (entry) {
      if (entry.handleResize) window.removeEventListener('resize', entry.handleResize);
      entry.term.dispose();
      delete terminalsRef.current[id];
      
      setTermIds(prev => {
        const newIds = prev.filter(tid => tid !== id);
        if (id === activeTermId) {
          setActiveTermId(newIds[newIds.length - 1] || null);
        }
        return newIds;
      });
      
      socket.emit('closeTerminal', { terminalId: id });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex space-x-2 p-2 bg-gray-900 border-b border-gray-800">
        <button 
          onClick={addTerminal} 
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition-colors flex items-center gap-1 active:scale-95 transform shadow-md"
        >
          <span className="text-lg font-bold">+</span> New Terminal
        </button>
        <div className="flex overflow-x-auto no-scrollbar gap-2">
          {termIds.map(id => (
            <div 
              key={id} 
              onClick={() => setActiveTermId(id)}
              className={`flex items-center cursor-pointer rounded overflow-hidden border transition-all ${
                id === activeTermId 
                  ? 'bg-gray-800 border-indigo-500 shadow-sm' 
                  : 'bg-dark-2 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <span className={`px-3 py-1 text-xs transition-colors ${
                id === activeTermId ? 'text-white font-medium' : 'text-gray-400'
              }`}>
                sh-{id.slice(0, 4)}
              </span>
              <button 
                onClick={(e) => closeTerminal(e, id)} 
                className="px-2 py-1 hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all border-l border-gray-700"
                title="Close Terminal"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-black">
        {termIds.map(id => (
          <div
            key={id}
            ref={terminalsRef.current[id]?.containerRef}
            className={`absolute inset-0 p-2 transition-opacity duration-150 ${
              id === activeTermId ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />
        ))}
        {termIds.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 italic space-y-2">
            <span className="text-2xl">⌨️</span>
            <span>No active terminal sessions</span>
          </div>
        )}
      </div>
    </div>
  );
}
