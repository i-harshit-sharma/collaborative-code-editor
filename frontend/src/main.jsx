import ReactDOM from 'react-dom/client'
import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import routes from './Routes.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in"
    // afterSignInUrl="/app"
    signInFallbackRedirectUrl="/app"
  >
    <RouterProvider router={routes} >
      <App />
    </RouterProvider>
  </ClerkProvider>
  // </React.StrictMode>,
)