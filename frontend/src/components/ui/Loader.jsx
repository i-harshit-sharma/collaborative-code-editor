import React from 'react';

const Loader = ({ message = "Provisioning your environment..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-4/60 backdrop-blur-md transition-all duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
        
        {/* Main spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        
        {/* Inner static circle or smaller spinner */}
        <div className="absolute h-10 w-10 animate-reverse-spin rounded-full border-l-2 border-r-2 border-blue-400/50"></div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-xl font-medium tracking-wide text-white antialiased">
          {message}
        </h2>
        <p className="text-sm text-gray-400 animate-pulse">
          This may take a few moments
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse-spin {
          animation: reverse-spin 1.5s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Loader;
