import { createBrowserRouter, Link, Outlet } from "react-router-dom";
import React from "react";
import Apps from "./pages/Apps.jsx";
import New from "./pages/New.jsx";
import Deployments from "./pages/Deployments.jsx";
import Home from "./pages/Home.jsx";
import Teams from "./pages/Teams.jsx";
import Usage from "./pages/Usage.jsx";
import SignIn from "./pages/signIn.jsx";
import SignUp from "./pages/signUp.jsx";
import AddUI from "./components/AddUI.jsx";
import About from "./pages/About.jsx";
import Working from "./pages/Working.jsx";
import Landing from "./pages/Landing.jsx";
import Try from "./pages/Try.jsx";
import Editor from "./pages/Editor.jsx";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

// Layout wrapper for protected routes
const AddUILayout = () => (
  <AddUI>
    <Outlet />
  </AddUI>
);

// Standard protected route: requires authentication
const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

// Conditionally protect Editor: check `hasPermission` before rendering
const ConditionallyProtect = ({ children }) => {
  const hasPermission = true; // TODO: replace with real permission check
  if (!hasPermission) {
    // Not signed in or no permission: redirect
    return (<><div>Permission Denied</div> <Login /></>);
  }
  // Signed in + has permission
  return <SignedIn>{children}</SignedIn>;
};

const Login = () => {
  return <div>Please <Link to="/sign-in">log in</Link> to access this content.</div>;
};

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
        <AddUILayout />
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
    path: "/working",
    element: <Working />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "*",
    element: <div>404 Not Found</div>,
  },
]);

export default routes;
