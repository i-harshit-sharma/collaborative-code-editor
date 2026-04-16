import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth, SignedIn } from "@clerk/clerk-react";
import { checkRepoPermission } from "../../api/repos";
import SignIn from "../../pages/signIn";

/**
 * Conditionally protects a route by checking permissions via the backend.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
const ConditionallyProtect = ({ children }) => {
  const { id } = useParams();
  const { isSignedIn, getToken } = useAuth();
  const [hasPermission, setHasPermission] = useState(null); // null = loading, true/false = result

  useEffect(() => {
    const fetchPermission = async () => {
      if (!isSignedIn) return;
      
      const token = await getToken();
      const allowed = await checkRepoPermission(id, token);
      setHasPermission(allowed);
    };

    fetchPermission();
  }, [id, isSignedIn, getToken]);

  if (!isSignedIn) {
    return <SignIn />;
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Checking permissions...</span>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You currently do not have permission to access this repository. 
          Recheck the URL or contact the owner.
        </p>
      </div>
    );
  }

  return <SignedIn>{children}</SignedIn>;
};

export default ConditionallyProtect;
