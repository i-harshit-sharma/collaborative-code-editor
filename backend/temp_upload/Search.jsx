import React, { useEffect } from 'react';

const GoogleSearch = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cse.google.com/cse.js?cx=155a9cc219cb5497a';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div className="gcse-search" ></div>;
};

export default GoogleSearch;
