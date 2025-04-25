import React, { use, useEffect, useState } from 'react'
import TextArea from './TextArea';
import ProjectList from '../components/ProjectList';
import { ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/clerk-react'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import New from './New';

const userName = "mailmehere090"

const Home = () => {
  const { getToken } = useAuth()
  const { isLoaded, user } = useUser()
  const [repoName, setRepoName] = useState('')
  const [language, setLanguage] = useState('')
  const [type, setType] = useState('')
  const [list, setList] = useState([])

  const handleClick = async () => {
    try {
      const token = await getToken();
      const response = await axios.get("http://localhost:4000/protected/test", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const handleSend = async () => {
    try {
      const get = async () => {
        const token = await getToken()
        const repos = await axios.post("http://localhost:4000/protected/create-repo",
          { repoName, language, type },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          })
        console.log(repos.data)
        setList(repos.data.user.repos)
        setRepoName('')
        setLanguage('')
        setType('')
      }
      get();
    } catch (error) {
      console.error(error);

    }
  };


  console.log(list);
  return (
    <div className='flex-grow h-full overflow-y-scroll no-scrollbar'>
      <section className='w-full flex flex-col items-center justify-center '>
        <h1 className='text-2xl font-semibold '>Hi <span className='bg-gradient-to-r from-blue-400 to-blue-1 text-transparent bg-clip-text'>{user?.firstName}</span> What do you want to make today?</h1>
        <div className='w-[760px]'>
          <TextArea />
          <div className='flex'>

            {/* <span>Here Ideas come</span> */}
          </div>
        </div>
      </section>
      <section className='w-full flex items-center justify-center'>
        <div className='w-[760px]'>
          <div className='flex justify-between'>
            <h1 className='text-xl font-semibold'>Your Recent Projects</h1>
            <Link to="/apps" className='text-md font-semibold flex items-center gap-2 border-1 rounded px-2 py-1 hover:bg-dark-2 cursor-pointer select-none border-dark-1'>View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <ProjectList limit={3} />
        </div>
      </section>
      {/* <button className='bg-red-400 px-4 py-2'
        onClick={handleClick}
      >Click Me</button> */}
      <section className='w-full flex flex-col items-center justify-center mt-4'>
        <Link to="/new" className='w-[760px] border border-dark-1 mb-6 rounded-lg cursor-pointer hover:bg-blue-1 hover:text-white text-blue-1 text-sm'>
          <h2 className='font-semibold mb-2 text-center py-2 '>Add a New Repository</h2>
          {/* <New/>
          <div className='flex flex-col gap-4'>
            <input
              type='text'
              placeholder='Repository Name'
              className='border px-4 py-2 rounded'
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
            <input
              type='text'
              placeholder='Language'
              className='border px-4 py-2 rounded'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
            <input
              type='text'
              placeholder='Type'
              className='border px-4 py-2 rounded'
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <button
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
              onClick={handleSend}
            >
              Add Repository
            </button>
            {repoName}, {language}, {type}
          </div> */}
        </Link>
      </section>

    </div>

  )
}

export default Home