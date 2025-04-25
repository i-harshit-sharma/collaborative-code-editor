import { createBrowserRouter, Link, Outlet, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import Test from "./pages/Test.jsx";
import TestEditor from "./pages/TestEditor.jsx";

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
  const { id } = useParams();
  const { isSignedIn, getToken } = useAuth();

  const [hasPermission, setHasPermission] = useState(null); // null = loading, true/false = result

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `http://localhost:4000/protected/check-repo/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setHasPermission(response.data.message === "User has access");
      } catch (err) {
        console.error("Permission check failed:", err);
        setHasPermission(false);
      }
    };

    if (isSignedIn) {
      fetchPermission();
    }
  }, [id, isSignedIn, getToken]);

  if (!isSignedIn) {
    return <SignIn />;
  }

  if (hasPermission === null) {
    return <div>Checking permissions...</div>;
  }

  if (!hasPermission) {
    return (
      <div>
        You currently do not have permission to access this path. Recheck the
        URL or try again.
      </div>
    );
  }

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
    element: <div>404 Not Found</div>,
  },
]);

export default routes;
