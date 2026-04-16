import React, { useState, useRef, useEffect } from 'react'
import TextArea from './TextArea'
import { ArrowDownToLine, Check, ChevronDown, GitFork, Github, Globe, Link, Lock, Plus, RefreshCw, SquareArrowOutUpRight, Star } from 'lucide-react'
import RenderSign from '../utils/RenderSign.jsx'
import { FaGithub } from "react-icons/fa";
import { frameworks } from '../utils/constants.js'
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/ui/Loader.jsx';
import { LANGUAGE_VERSIONS } from '../utils/constants.js'
// import Videocall from '../components/features/collaboration/Videocall.jsx';


async function fetchRandomWord(signal) {
  const response = await fetch("https://random-word-api.herokuapp.com/word?diff=2&number=3", { signal });
  if (!response.ok) {
    throw new Error("Failed to fetch word");
  }
  const data = await response.json();
  return data;
}

async function generateRandomName(signal) {
  try {
    const words = await fetchRandomWord(signal)
    return words.join("_");
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    console.error("Error generating random name: ", error);
    return "";
  }
}

export function Combobox({ onChange, def, disabled = false }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(def ? def : "")
  const [search, setSearch] = useState("")
  const popoverRef = useRef(null)
  const inputRef = useRef(null)

  const toggleDropdown = () => setOpen((prev) => !prev)

  const handleSelect = (selectedValue) => {
    setValue((prev) => (prev === selectedValue ? "" : selectedValue))
    onChange(selectedValue)
    setOpen(false)
    setSearch("")
  }
  console.log(value)

  const filtered = frameworks.filter((fw) =>
    fw.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <div className="relative w-full bg-dark-4 mt-2" ref={popoverRef}>
      <button
        onClick={toggleDropdown}
        className="flex justify-between border border-dark-1 px-3 py-1 items-center rounded w-full text-sm cursor-pointer"
        aria-expanded={open}
        role="combobox"
      >
        {value
          ? frameworks.find((fw) => fw.value === value)?.label
          : "Select framework..."}
        <span className="ml-2 opacity-50 "><ChevronDown /></span>
      </button>
      {open && !disabled && (
        <div className="absolute z-10 mt-1 w-full border  border-dark-1 rounded shadow bg-dark-4">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search framework..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border px-2 py-1 rounded border-dark-1 bg-dark-4 outline-none "
            />
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar bg-dark-4">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No framework found.
              </div>
            ) : (
              filtered.map((fw) => (
                <div
                  key={fw.value}
                  onClick={() => handleSelect(fw.value)}
                  className={`cursor-pointer px-3 py-2.5 text-sm flex items-center justify-between hover:bg-dark-1 transition-colors ${value === fw.value ? "bg-dark-2" : ""}`}
                >
                  <div className='flex items-center gap-3'>
                    <RenderSign language={fw.value} size={20} />
                    <div className="flex flex-col">
                      <span className="font-medium">{fw.label}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{fw.tag}</span>
                    </div>
                  </div>
                  <span className={`${value === fw.value ? "opacity-100" : "opacity-0"}`}>
                    <Check size={16} className="text-blue-500" />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}



const GithubPublicRepo = () => {
  const { getToken } = useAuth()
  const handleClone = async ({ url }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ url, repoName: "DefaultRepoName" }),
      });
      const { message, error } = await res.json();
      if (res.ok) {
        // setStatus(message);
      } else {
        // setStatus(`Error: ${error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (repoUrl) {
      fetchRepoInfo();
    }
  }, [repoUrl])

  const fetchRepoInfo = async () => {
    try {
      // Extract owner and repo from the URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        setError('Invalid GitHub URL');
        setRepoData(null);
        return;
      }

      const [_, owner, repo] = match;

      // Fetch from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) throw new Error('Repository not found');

      const data = await response.json();
      setRepoData(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setRepoData(null);
    }
  };
  console.log(repoData)

  return (
    <div className="p-4">

      <input
        type="text"
        placeholder="Enter GitHub repo URL"
        className="border-1 border-dark-1 p-2 w-64 rounded mb-2 text-sm focus-visible:ring-0 focus-visible:outline-1 outline-blue-1"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {repoData && (
        <div className=" p-4 border rounded shadow flex flex-col gap-2">
          <div className='flex gap-2'>
            <img src={repoData.owner.avatar_url} alt="owner img" height={24} width={24} />
            <h2 className="text-lg font-semibold">{repoData.full_name}</h2>
          </div>
          <p>{repoData.description}</p>
          <div className='flex gap-2 items-center'><Star size={16} /> Stars: {repoData.stargazers_count}</div>
          <div className='flex gap-2 items-center'><GitFork size={16} /> Forks: {repoData.forks_count}</div>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline flex items-center gap-2 bg-dark-4 w-fit px-2 rounded"
          >
            View on GitHub <SquareArrowOutUpRight size={16} />
          </a>
          <div className='flex items-center gap-2 bg-blue-1 px-2 py-1 cursor-pointer rounded text-sm w-26' onClick={() => handleClone({ url: repoUrl })}>
            <ArrowDownToLine size={20} />
            Import
          </div>
        </div>
      )}
    </div>
  );
};


const New = () => {
  const [selected, setselected] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [name, setName] = useState("");
  const [github, setGithub] = useState("url");
  const [status, setStatus] = useState("")
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState("public");
  const [isTemporary, setIsTemporary] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const handleSend = async () => {
    if (!name.trim()) {
      setStatus("Please enter an app title");
      return;
    }
    if (!selectedTemplate) {
      setStatus("Please select a template");
      return;
    }

    setLoading(true);
    setStatus("Creating repository...");
    try {
      const token = await getToken();
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/protected/create-repo`,
        { repoName: name, language: selectedTemplate, type: selectedOption },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

      const { repo } = response.data;
      if (repo && repo.vmId) {
        navigate('/editor/' + repo.vmId);
      } else {
        throw new Error("Repository created but vmId not found");
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to create repository: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleGenerate = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    try {
      const randomName = await generateRandomName(abortControllerRef.current.signal);
      setName(randomName);
      setIsGenerating(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error);
        setIsGenerating(false);
      }
    }
  };

  const handleInputChange = (e) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setName(e.target.value);
  };
  useEffect(() => {
    handleGenerate()
  }, [])
  // handleGenerate()




  return (
    <div className='flex-grow h-full overflow-y-scroll no-scrollbar'>
      {loading && <Loader message="Provisioning your environment..." />}
      <section className='mx-48 my-20 '>
        <h1 className='text-2xl font-bold'>Create a new App</h1>
        <div className='mt-10 border-b-1 border-dark-1 flex'>
          <div className={`cursor-pointer p-2 rounded ${selected === 'ai' ? 'bg-dark-2' : ''}`} onClick={() => setselected('ai')}>Create using AI</div>
          <div className={`cursor-pointer p-2 rounded ${selected === 'template' ? 'bg-dark-2' : ''}`} onClick={() => setselected('template')}>Create using template</div>
          <div className={`cursor-pointer p-2 rounded ${selected === 'github' ? 'bg-dark-2' : ''}`} onClick={() => setselected('github')}>Import from Github</div>
        </div>
        {selected === 'ai' && (
          <div className='mt-2'>
            <h1 className='text-xl font-semibold'>What do you want to build?</h1>
            <div className='mt-2 w-full'>
              <TextArea />
            </div>
          </div>
        )}
        {selected === 'template' && (
          <div className='mt-2 flex gap-4 h-26'>
            <div className='flex-1/2'>
              <div className='text-sm'>Template</div>
              <Combobox onChange={(e) => setSelectedTemplate(e)} />
              {
                selectedTemplate && (() => {
                  const template = frameworks.find((fw) => fw.value === selectedTemplate);
                  const version = LANGUAGE_VERSIONS[template.language.toLowerCase()] || "Latest";
                  return (
                    <div className='w-full mt-3 p-4 rounded border border-dark-1 bg-dark-4'>
                      <div className='flex justify-between items-start mb-4'>
                        <div className="flex items-center gap-3">
                          <RenderSign language={template.value} size={32} />
                          <div className="flex flex-col">
                            <h3 className="text-md font-semibold text-white">{template.label}</h3>
                            <div className='text-[10px] w-fit border border-dark-1 rounded-xl px-2 py-0.5 text-gray-400'>
                              {template.tag}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Language</p>
                          <div className="flex items-center gap-2">
                            <RenderSign language={template.language.toLowerCase()} size={14} />
                            <span className="text-sm">{template.language}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Version</p>
                          <span className="text-sm text-blue-400">{version}</span>
                        </div>
                      </div>

                      <div className='text-sm text-gray-300'>
                        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Description</p>
                        {template.description}
                      </div>
                    </div>
                  );
                })()
              }
            </div>
            <div className=' flex-1/2'>
              <div className='text-sm '>Title</div>
              <div className='relative flex items-center'>
                <input
                  className='w-full bg-dark-4 mt-2 p-1 pr-8 rounded border border-dark-1 focus-visible:ring-0 focus-visible:outline-1 outline-blue-1'
                  value={name}
                  onChange={handleInputChange}
                  placeholder={isGenerating ? "Generating..." : "Enter app title"}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`absolute right-2 top-4 text-gray-400 hover:text-white transition-colors cursor-pointer ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Generate random title"
                >
                  <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="mt-2 text-sm">Privacy</div>

              <div className="flex flex- gap-12 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="options"
                    value="public"
                    checked={selectedOption === "public"}
                    onChange={handleChange}
                    className="accent-blue-500 w-4 h-4 outline-0 bg-dark-1 cursor-pointer"
                  />
                  <div className='flex gap-2 items-center'>Public<Globe size={18} /></div>
                </label>
                <div className='text-sm'>Anyone can view and fork this App.</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="options"
                    value="private"
                    checked={selectedOption === "private"}
                    onChange={handleChange}
                    className="accent-blue-500 w-4 h-4 outline-0 bg-dark-1 cursor-pointer"
                  />
                  <div className='flex gap-2 items-center'>Private <Lock size={18} /></div>
                </label>
                <div className='text-sm'>Only you can see and edit this App.</div>
              </div>
              <div className='flex gap-2 items-center mt-4'>
                <input type="checkbox" className='cursor-pointer h-4.5 w-4.5' id='isTemp' checked={isTemporary} onChange={() => { setIsTemporary(!isTemporary) }} />
                <label htmlFor="isTemp" className='select-none cursor-pointer'>Make Repository Permanent</label>
              </div>
              <div className='bg-blue-1 px-2 py-1 mt-7.5 flex items-center justify-center gap-2 rounded ' onClick={handleSend}>
                <Plus />
                <div>Submit</div>
              </div>
            </div>
          </div>
        )}
        {selected === 'github' && (
          <div>
            <div className='w-full mt-3 rounded border border-dark-1 min-h-64'>
              <div className='border-b-1 border-dark-1 flex gap-2'>
                <div className={`flex gap-2 items-center hover:bg-dark-1 rounded px-1 cursor-pointer py-1 ${github === 'myRepos' ? 'bg-dark-2' : ''}`} onClick={() => setGithub('myRepos')}>
                  <FaGithub size={20} />
                  My Repositories
                </div>
                <div className={`flex gap-2 items-center hover:bg-dark-1 rounded px-1 cursor-pointer py-1 ${github === 'url' ? 'bg-dark-2' : ''}`} onClick={() => setGithub('url')}>
                  <Link size={20} />
                  From URL
                </div>
              </div>
              {github === 'myRepos' ? (
                "Hi"
              ) : (
                <div className='p-2'>
                  <GithubPublicRepo />
                  {/* <input placeholder='Github Repository URL' className='rounded p-1.5 min-w-24 text-sm bg-dark-4 border border-dark-1 focus-visible:ring-0 focus-visible:outline-1 outline-blue-1'/> */}
                </div>
              )}




            </div>
            <div className="flex flex- gap-12 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="options"
                  value="public"
                  checked={selectedOption === "public"}
                  onChange={handleChange}
                  className="accent-blue-500 w-4 h-4 outline-0 bg-dark-1 cursor-pointer"
                />
                <div className='flex gap-2 items-center'>Public<Globe size={18} /></div>
              </label>
              <div className='text-sm'>Anyone can view and fork this App.</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="options"
                  value="private"
                  checked={selectedOption === "private"}
                  onChange={handleChange}
                  className="accent-blue-500 w-4 h-4 outline-0 bg-dark-1 cursor-pointer"
                />
                <div className='flex gap-2 items-center'>Private <Lock size={18} /></div>
              </label>
              <div className='text-sm'>Only you can see and edit this App.</div>
            </div>
            <div className='flex items-center justify-between mt-4'>
              <div className='flex gap-2 items-center '>
                <input type="checkbox" className='cursor-pointer h-4.5 w-4.5' id='isTemp' checked={isTemporary} onChange={() => { setIsTemporary(!isTemporary) }} />
                <label htmlFor="isTemp" className='select-none cursor-pointer'>Make Repository Permanent</label>
              </div>
              {/* <div className='flex items-center gap-2 bg-blue-1 px-2 py-1 cursor-pointer rounded text-sm'>
                <ArrowDownToLine size={20} />
                Import
              </div> */}
            </div>
          </div>
        )}
      </section>
      {status}
      {/* <Videocall/> */}
    </div>
  )
}

export default New