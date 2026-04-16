import { createBrowserRouter } from "react-router-dom";
import React from "react";

// Pages
import Apps from "./pages/Apps.jsx";
import New from "./pages/New.jsx";
import Deployments from "./pages/Deployments.jsx";
import Home from "./pages/Home.jsx";
import Teams from "./pages/Teams.jsx";
import Usage from "./pages/Usage.jsx";
import SignIn from "./pages/signIn.jsx";
import SignUp from "./pages/signUp.jsx";
import About from "./pages/About.jsx";
import Working from "./pages/Working.jsx";
import Landing from "./pages/Landing.jsx";
import Try from "./pages/Try.jsx";
import Editor from "./pages/Editor.jsx";
import Test from "./pages/Test.jsx";
import TestEditor from "./pages/TestEditor.jsx";

// Auth & Layout
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ConditionallyProtect from "./components/auth/ConditionallyProtect";

// Router configuration
const routes = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "app", element: <Home /> },
      { path: "apps", element: <Apps /> },
      { path: "new", element: <New /> },
      { path: "deployments", element: <Deployments /> },
      { path: "teams", element: <Teams /> },
      { path: "usage", element: <Usage /> },
    ],
  },
  {
    path: "/editor/:id",
    element: (
      <ConditionallyProtect>
        <Editor />
      </ConditionallyProtect>
    ),
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/try",
    element: <Try />,
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/test/editor/:id",
    element: <TestEditor />,
  },
  {
    path: "/working",
    element: <Working />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "*",
    element: <div className="flex items-center justify-center min-h-screen text-2xl font-bold">404 Not Found</div>,
  },
]);

export default routes;
