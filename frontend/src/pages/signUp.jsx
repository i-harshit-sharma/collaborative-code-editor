import React from 'react'
import { SignUp } from '@clerk/clerk-react'

const signUp = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-dark-4'>
      <SignUp/>
    </div>
  )
}

export default signUp