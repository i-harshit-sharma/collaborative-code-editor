import React, { useState, useRef, useEffect } from 'react'
import { TextArea } from './TextArea'
import { ArrowDownToLine, Check, ChevronDown, GitFork, Github, Globe, Link, Lock, Plus, SquareArrowOutUpRight, Star } from 'lucide-react'
import RenderSign from '../utils/RenderSign.jsx'
import { FaGithub } from "react-icons/fa";
import { frameworks } from '../utils/constants.js'


async function fetchRandomWord() {
  const response = await fetch("https://random-word-api.vercel.app/api?words=3");
  if (!response.ok) {
    throw new Error("Failed to fetch word");
  }
  const data = await response.json();
  return data;
}

async function generateRandomName() {
  try {
    const words = await fetchRandomWord()
    return words.join("_");
  } catch (error) {
    console.error("Error generating random name: ", error);
    return "";
  }
}

export function Combobox({ onChange, def, disabled=false }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(def? def: "")
  const [search, setSearch] = useState("")
  const popoverRef = useRef(null)

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
      {open && !disabled &&(
        <div className="absolute z-10 mt-1 w-full border  border-dark-1 rounded shadow bg-dark-4">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search framework..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border px-2 py-1 rounded border-dark-1"
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
                  className={`cursor-pointer px-3 py-2 text-sm flex items-center justify-between hover:bg-dark-1 ${value === fw.value ? "" : ""
                    }`}
                >
                  <div className='flex items-center gap-3 '>
                    <RenderSign language={fw.value} />
                    {fw.label}
                  </div>
                  <span className={`mr-2 ${value === fw.value ? "opacity-100" : "hidden"}`}>
                    <Check size={16} />
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
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState('');

  useEffect(()=>{
    if(repoUrl){
      fetchRepoInfo();
    }
  },[repoUrl])

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
            <img src={repoData.owner.avatar_url} alt="owner img" height={24} width={24}/>
          <h2 className="text-lg font-semibold">{repoData.full_name}</h2>
            </div>
          <p>{repoData.description}</p>
          <div className='flex gap-2 items-center'><Star size={16}/> Stars: {repoData.stargazers_count}</div>
          <div className='flex gap-2 items-center'><GitFork size={16}/> Forks: {repoData.forks_count}</div>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline flex items-center gap-2 bg-dark-4 w-fit px-2 rounded"
          >
            View on GitHub <SquareArrowOutUpRight  size={16}/>
          </a>
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

  const [selectedOption, setSelectedOption] = useState("public");
  const [isTemporary, setIsTemporary] = useState(false);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleGenerate = async () => {
    const randomName = await generateRandomName();
    setName(randomName);
  };
  useEffect(() => {
    handleGenerate()
  }, [])
  // handleGenerate()

  return (
    <div className='flex-grow h-full overflow-y-scroll no-scrollbar'>
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
                selectedTemplate && (
                  <div className='w-full mt-3 p-3 rounded border border-dark-1'>
                    <div className='flex justify-between items-center'>
                      <RenderSign language={frameworks.find((fw) => fw.value === selectedTemplate)?.value} size={32} />
                      <div className='text-xs border-1 border-dark-1 rounded-xl px-2 py-1'>{frameworks.find((fw) => fw.value === selectedTemplate)?.tag}</div>
                    </div>
                    <div>
                      {frameworks.find((fw) => fw.value === selectedTemplate)?.label}
                    </div>
                    <div className='text-sm mt-12'>
                      {frameworks.find((fw) => fw.value === selectedTemplate)?.description}
                    </div>
                  </div>
                )
              }
            </div>
            <div className=' flex-1/2'>
              <div className='text-sm '>Title</div>
              <input className='w-full bg-dark-4 mt-2 p-1 rounded border border-dark-1 focus-visible:ring-0 focus-visible:outline-1 outline-blue-1' value={name} onChange={(e) => setName(e.target.value)} />
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
                {/* <div className='text-sm'>Anyone can view and fork this App.</div> */}
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
                {/* <div className='text-sm'>Only you can see and edit this App.</div> */}
              </div>
              <div className='flex gap-2 items-center mt-4'>
                <input type="checkbox" className='cursor-pointer h-4.5 w-4.5' id='isTemp' checked={isTemporary} onChange={() => { setIsTemporary(!isTemporary) }} />
                <label htmlFor="isTemp" className='select-none cursor-pointer'>Make Repository Permanent</label>
              </div>
              <div className='bg-blue-1 px-2 py-1 mt-7.5 flex items-center justify-center gap-2 rounded '>
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
            ):(
              <div className='p-2'>
                <GithubPublicRepo/>
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
                {/* <div className='text-sm'>Anyone can view and fork this App.</div> */}
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
                {/* <div className='text-sm'>Only you can see and edit this App.</div> */}
              </div>
              <div className='flex items-center justify-between mt-4'>
              <div className='flex gap-2 items-center '>
                <input type="checkbox" className='cursor-pointer h-4.5 w-4.5' id='isTemp' checked={isTemporary} onChange={() => { setIsTemporary(!isTemporary) }} />
                <label htmlFor="isTemp" className='select-none cursor-pointer'>Make Repository Permanent</label>
              </div>
              <div className='flex items-center gap-2 bg-blue-1 px-2 py-1 cursor-pointer rounded text-sm'>
                <ArrowDownToLine size={20}/>
              Import
              </div>
              </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default New