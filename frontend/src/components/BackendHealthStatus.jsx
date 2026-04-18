import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api';

/**
 * BackendHealthStatus Component
 * Monitors the backend health and displays a premium overlay if unreachable.
 */
const BackendHealthStatus = () => {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await api.get('/health');
      if (response.status === 200 && response.data.status === 'ok') {
        setIsHealthy(true);
      } else {
        setIsHealthy(false);
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsHealthy(false);
    } finally {
      // Small delay to allow animation to feel natural
      setTimeout(() => setIsChecking(false), 800);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Poll every 15 seconds for responsiveness
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!isHealthy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl"
        >
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ repeat: Infinity, duration: 10 }}
              className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-crimson-600/20 rounded-full blur-[120px]" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ repeat: Infinity, duration: 15 }}
              className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px]" 
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative flex flex-col items-center w-full max-w-md p-10 mx-auto text-center border shadow-2xl rounded-3xl bg-slate-900/40 border-white/10 backdrop-blur-md"
          >
            {/* Status Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0px rgba(239, 68, 68, 0)',
                  '0 0 0 15px rgba(239, 68, 68, 0.1)',
                  '0 0 0 0px rgba(239, 68, 68, 0)'
                ]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center justify-center w-20 h-20 mb-8 border rounded-full bg-red-500/10 border-red-500/30 text-red-500"
            >
              <AlertCircle size={42} strokeWidth={2.5} />
            </motion.div>

            {/* Content */}
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              System <span className="text-red-500">Offline</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-slate-400">
              We're currently polishing the gears behind the scenes. <br />
              Please wait while we restore service.
            </p>

            {/* Action Button */}
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className={`
                group relative flex items-center justify-center gap-3 px-8 py-4 w-full rounded-2xl font-bold text-lg transition-all active:scale-95
                ${isChecking 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-crimson-600 text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.6)] hover:-translate-y-0.5'
                }
              `}
            >
              <RefreshCw 
                className={`w-5 h-5 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
              />
              {isChecking ? 'Checking System...' : 'Try Reconnecting'}
            </button>

            <div className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 opacity-50">
              Automatic retry in 15s
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackendHealthStatus;
