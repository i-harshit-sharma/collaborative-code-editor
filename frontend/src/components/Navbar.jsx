import React, { useEffect, useRef, useState } from 'react'
import { HelpDropDown, NotificationDropDown, OrgDropDown } from './OrgDropDown'
import { Folder, PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react'
import RenderSign from '../utils/RenderSign';
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { UserButton } from '@clerk/clerk-react'
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const notificationsArray = [
    {
        title: "New Notification",
        description: "You have a new notification",
        status: "unread",
        time: "2h",
    },
    {
        title: "New Message",
        description: "You have a new message",
        status: "unread",
        time: "1h",
    },
    {
        title: "New Comment",
        description: "You have a new comment",
        status: "read",
        time: "30m",
    },
    {
        title: "New Like",
        description: "You have a new like",
        status: "read",
        time: "10m",
    },
    {
        title: "New Follower",
        description: "You have a new follower",
        status: "unread",
        time: "5m",
    },
    {
        title: "New Mention",
        description: "You have been mentioned in a comment",
        status: "read",
        time: "1m",
    },
    {
        title: "New Event",
        description: "You have a new event invitation",
        status: "unread",
        time: "0m",
    },
    {
        title: "New Task",
        description: "You have a new task assigned to you",
        status: "read",
        time: "2h",
    },
    {
        title: "New Reminder",
        description: "You have a new reminder",
        status: "unread",
        time: "1h",
    },
    {
        title: "New Update",
        description: "You have a new update",
        status: "read",
        time: "30m",
    },
]

function getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past; // in ms

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    return `${years} year${years === 1 ? '' : 's'} ago`;
}


const SearchResults = ({ icon, title, description, lnk}) => {
    return (
        <Link to={lnk} className='group flex flex-start hover:bg-dark-2 py-1.5 items-center gap-2 px-2 border-t-2 border-t-dark-2/40 cursor-pointer w-full'>
            <div className='flex min-w-fit justify-center items-center bg-dark-2 group-hover:bg-[#063b72] px-2 py-1 rounded gap-1 transition-colors'>
                <span>{icon}</span>
                <span className='text-sm select-none'>{title}</span>
            </div>
            <div className='text-nowrap text-xs overflow-hidden select-none'>{description}</div>
            {/* {lnk && <Link to={lnk} className=''>{lnk}</Link>} */}
        </Link>
    );
};


const Navbar = ({
    isOpen,
    toggleNavbar }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false)
    const SearchInput = useRef(null);
    const [notifications, setNotifications] = useState(notificationsArray);
    const [data, setData] = useState([]);
    const {getToken} = useAuth();
    const containerRef = useRef(null);
  

    useEffect(() => {
        const get = async () => {
            try {
                const token = await getToken();
                const response = await axios.get("http://localhost:4000/protected/get-repos", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                console.log(response.data)
                setData(response.data)
            } catch (error) {
                console.error(error);
            }
            try {
                const token = await getToken();
                const response = await axios.get("http://localhost:4000/protected/get-shared-repos", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                console.log(response.data)
                setData((prev) => [...prev, ...response.data])
            } catch (error) {
                console.error(error);
            }
        }
        get()
    }, [])
    console.log(data)

    useEffect(() => {
        const onClick = e => {
          if (containerRef.current && !containerRef.current.contains(e.target)) {
            setOpen(false);
          }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
      }, []);
    

    const handleNotifications = (index) => {
        const newNotifications = [...notifications];
        newNotifications[index].status = "read";
        setNotifications(newNotifications);
    };

    const filtered = data.filter(item =>
        item?.repoName?.toLowerCase().includes(query?.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                SearchInput.current.focus();
                setOpen(true);
            }

        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    return (
        <div className='relative h-12 border-b-1 border-b-dark-2 top-0 w-full flex justify-between items-center pr-4 '>
            <div className='h-full flex items-center gap-2 cursor-pointer'>
                <OrgDropDown  isOpen={isOpen}/>
                {isOpen ?
                    <PanelLeftClose size={28} className="p-1.5 hover:bg-dark-1 rounded"  onClick={toggleNavbar} /> :
                    <PanelLeftOpen  size={28} className="p-1.5 hover:bg-dark-1 rounded"  onClick={toggleNavbar}/>
                }
                <p className='text-xl font-bold ml-2'>Code Collab</p>
            </div>
            <div className=' border-1 border-dark-2 absolute top-2 left-1/2 transform -translate-x-1/2 bg-dark-4 rounded-sm lg:w-[530px] flex flex-col' 
                ref={containerRef}>
                <div className='flex items-center gap-2 w-full h-full px-2'>
                    <Search size={20} />
                    <input type="text" ref={SearchInput} className='w-full h-full bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-300 text-sm hover:text-gray-50' placeholder='Search...' onChange={(e) => setQuery(e.target.value)} value={query} onFocus={() => setOpen(true)} 
                    />
                    <div className='p-1'>
                        <span className='border-1 text-sm border-dark-2 px-1 rounded'>Ctrl</span>
                        &nbsp;
                        <span className='border-1 text-sm border-dark-2 px-1 rounded'>K</span>
                    </div>
                </div>
                {/* Dropdown for search results */}
                {open && <ul>
                    <SearchResults icon={<Plus size={16} />} title="New" description="Create a New App" lnk={`http://localhost:5173/new`}/>
                    <SearchResults icon={<Folder size={16} />} title="My Apps" description="Search your Apps" lnk={`http://localhost:5173/apps`}/>
                </ul>}
                {/* {query} */}
                {open && !!query.length && <ul className='cursor-pointer'>
                    {filtered.map((item, i) => (
                        <SearchResults key={i} icon={<RenderSign language={item.language} />} title={item.repoName} description={getTimeAgo(item.createdAt)} lnk={`http://localhost:5173/editor/${item.vmId}`}/>
                    ))}
                </ul>}
            </div>

            <div className='h-6 flex gap-2 items-center'>
                {/*<NotificationDropDown notifications={notifications} setNotifications={handleNotifications} />*/}
                <div className='p-1.5 hover:bg-dark-1 rounded cursor-pointer'>
                    {/* <HelpDropDown /> */}
                </div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </div>
    )
}

export default Navbar