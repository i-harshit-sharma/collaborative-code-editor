import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './Routes';
import BackendHealthStatus from './components/BackendHealthStatus';
import './App.css';

/**
 * Main Application component.
 * Provides the router and global health monitoring.
 */
const App = () => {
  return (
    <div className="app-container">
      <BackendHealthStatus />
      <RouterProvider router={routes} />
    </div>
  );
};

export default App;
