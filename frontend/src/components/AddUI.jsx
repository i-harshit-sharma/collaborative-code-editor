import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AddUI = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className='h-screen w-full'>
      <Navbar isOpen={isSidebarOpen} toggleNavbar={() => setIsSidebarOpen((prev) => !prev)} />
      <div className='flex h-[calc(100%-48px)] w-full'>
        <Sidebar isOpen={isSidebarOpen} />
        {children}
      </div>
    </div>
  )
}

export default AddUI