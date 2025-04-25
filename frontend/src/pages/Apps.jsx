import React from 'react'
import ProjectList from '../components/ProjectList'

const Apps = () => {
  return (
    <div className='flex flex-col mx-16 items-center w-full'>
    <h1 className='text-2xl font-semibold '>Your Projects</h1>
    <div className='flex flex-col justify-center items-center  gap-4 w-full '>
      <ProjectList/>
    </div>
    <h1 className='text-2xl font-semibold '>Shared with you</h1>
    <div className='flex flex-col justify-center items-center  gap-4 w-full '>
      <ProjectList shared={true}/>
    </div>
    </div>
  )
}

export default Apps