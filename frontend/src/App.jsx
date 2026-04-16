import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './Routes';
import './App.css';

/**
 * Main Application component.
 * Provides the router and global styles.
 */
const App = () => {
  return (
    <div className="app-container">
      <RouterProvider router={routes} />
    </div>
  );
};

export default App;
