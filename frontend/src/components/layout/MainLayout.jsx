import React from "react";
import { Outlet } from "react-router-dom";
import AddUI from "./AddUI";

/**
 * Main application layout wrapper.
 */
const MainLayout = () => (
  <AddUI>
    <Outlet />
  </AddUI>
);

export default MainLayout;
