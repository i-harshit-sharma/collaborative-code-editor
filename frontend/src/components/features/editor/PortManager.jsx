import React, { useState } from 'react';
import { Globe, Plus, ExternalLink, RefreshCw, X } from 'lucide-react';

const PortManager = ({ vmId, defaultPorts }) => {
  const [ports, setPorts] = React.useState([3000, 5000, 8000, 8080]);
  const [newPort, setNewPort] = React.useState('');

  React.useEffect(() => {
    if (defaultPorts && defaultPorts.length > 0) {
      // Merge unique ports and sort
      setPorts(prev => {
        const combined = [...new Set([...prev, ...defaultPorts])];
        return combined.sort((a, b) => a - b);
      });
    }
  }, [defaultPorts]);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const addPort = () => {
    const port = parseInt(newPort);
    if (port > 0 && port <= 65535 && !ports.includes(port)) {
      setPorts([...ports].sort((a, b) => a - b));
      setPorts(prev => [...prev, port].sort((a, b) => a - b));
      setNewPort('');
    }
  };

  const removePort = (portToRemove) => {
    setPorts(ports.filter(p => p !== portToRemove));
  };

  const getProxyUrl = (port) => {
    return `${backendUrl}/proxy/${vmId}/${port}/`;
  };

  return (
    <div className="flex flex-col h-full bg-dark-3 text-gray-300 p-4">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
        <Globe size={20} className="text-blue-400" />
        <h2 className="text-lg font-semibold">Port Forwarding</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={newPort}
          onChange={(e) => setNewPort(e.target.value)}
          placeholder="Enter port..."
          className="flex-1 bg-dark-4 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addPort}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {ports.map((port) => (
          <div
            key={port}
            className="flex items-center justify-between bg-dark-4 p-3 rounded border border-gray-800 hover:border-gray-700 transition-all group"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Port {port}</span>
              <span className="text-[10px] text-gray-500 font-mono italic">Forwarded</span>
            </div>
            
            <div className="flex gap-2">
              <a
                href={getProxyUrl(port)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"
                title="Open in browser"
              >
                <ExternalLink size={16} />
              </a>
              <button
                onClick={() => removePort(port)}
                className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}

        {ports.length === 0 && (
          <div className="text-center py-10 text-gray-500 italic text-sm">
            No active ports. Add one above.
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-[11px] text-blue-300 leading-relaxed">
           Your services are proxied through the backend. Use the links to access web servers running inside your VM.
        </p>
      </div>
    </div>
  );
};

export default PortManager;
