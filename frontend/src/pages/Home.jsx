import React, { use, useEffect, useState } from 'react'
import TextArea from './TextArea';
import ProjectList from '../components/features/dashboard/ProjectList';
import { ArrowRight, Plus } from 'lucide-react';
import { useUser } from '@clerk/clerk-react'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import New from './New';
import { Button } from "../components/ui/button";


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
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/protected/test`, {
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
        const repos = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/protected/create-repo`,
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
    <div className='flex-grow h-full overflow-y-auto no-scrollbar pb-12'>
      <section className='w-full flex flex-col items-center justify-center pt-20 pb-12 px-6'>
        <div className='max-w-3xl w-full space-y-6 text-center'>
            <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
                Hi <span className='bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text'>{user?.firstName}</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium">What do you want to build today?</p>
            <div className='w-full'>
                <TextArea />
            </div>
        </div>
      </section>

      <section className='w-full flex flex-col items-center justify-center px-6 space-y-12'>
        <div className='max-w-5xl w-full'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-white'>Recent Projects</h2>
            <Link to="/apps">
                <Button variant="outline" size="sm" className="gap-2 border-dark-1 hover:bg-dark-2">
                    View All <ArrowRight size={16} />
                </Button>
            </Link>
          </div>
          <ProjectList limit={4} />
        </div>

        <div className='max-w-5xl w-full'>
            <Link to="/new" className='block group'>
                <div className='w-full p-8 rounded-2xl border border-dark-1 bg-dark-4 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-center space-y-4'>
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                           <Plus className="size-8" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className='text-xl font-bold text-white'>Add a New Repository</h3>
                        <p className="text-gray-400 text-sm">Kickstart your next big idea with a new project</p>
                    </div>
                </div>
            </Link>
        </div>
      </section>
    </div>
  )
}


export default Home