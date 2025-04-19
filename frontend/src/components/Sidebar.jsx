import { BookOpen, CloudUpload, Disc, FileJson, Folder, Gauge, House, Monitor, Plus, Presentation, Users } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = ({ isOpen }) => {
  return (
    <>
      {isOpen ? (
        <div className=' overflow-y-scroll no-scrollbar'>
        <div className='w-50 border-r-1 border-dark-2 flex flex-col relative left-0 group h-full'>
          <div className='border-b-1 border-b-dark-1 text-gray-300 group-hover:text-white'>
            <Link to="/new" className="flex items-center gap-2 justify-center py-1.5 cursor-pointer select-none rounded text-sm m-2 border-1 border-dark-1 hover:bg-dark-2">
              <Plus size={16} />
              Create App
            </Link>
            <div className="flex items-center gap-2 justify-center py-1.5 cursor-pointer select-none rounded text-sm m-2 border-1 border-dark-1 hover:bg-dark-2">
              <Presentation size={16} />
              Join Meeting
            </div>
            <Link to='/app' className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2  hover:bg-dark-2">
              <House size={16} />
              Home
            </Link>
            <Link to="/apps" className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Folder size={16} />
              Apps
            </Link>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <CloudUpload size={16} />
              Deployments
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Gauge size={16} />
              Usage
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Users size={16} />
              Teams
            </div>
          </div>

          <div className='border-b-1 border-b-dark-1 text-gray-300 group-hover:text-white'>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-xs m-1">
              Explore
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <FileJson size={16} />
              Templates
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <BookOpen size={16} />
              Documentation
            </div>
          </div>
          <div className='border-b-1 border-b-dark-1 text-gray-300 group-hover:text-white'>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-xs m-1">
              Sessions
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Disc size={16} />
              Meeting Recordings
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Presentation size={16} />
              Past Meetings
            </div>
          </div>
          <div className='border-b-1 border-b-dark-1 text-gray-300 group-hover:text-white '>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-xs m-1">
              Your Apps
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Disc size={16} />
              Meeting Recordings
            </div>
            <div className="flex items-center gap-2  p-1.5 cursor-pointer select-none rounded text-sm m-2 hover:bg-dark-2">
              <Presentation size={16} />
              Past Meetings
            </div>
          </div>
            <div className='text-sm flex items-center p-1 justify-between mx-1'>
              Install CodeTogether
              <Monitor size={16} className='cursor-pointer'/>
              </div>
        </div>
        </div>) : null}
    </>

  )
}

export default Sidebar