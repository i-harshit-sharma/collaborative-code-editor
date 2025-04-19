import { SignIn } from '@clerk/clerk-react'
import React from 'react'

const signIn = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-dark-4'>
      <SignIn/>
    </div>
  )
}

export default signIn