import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-dark-2/40 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer" />
      <div className="absolute inset-0 animate-pulse bg-white/5" />
    </div>
  );
};

export default Skeleton;
