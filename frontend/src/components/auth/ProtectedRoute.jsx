import React from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

/**
 * Standard protected route: requires authentication via Clerk.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
const ProtectedRoute = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

export default ProtectedRoute;
