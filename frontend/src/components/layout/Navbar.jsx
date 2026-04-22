import React, { useEffect, useRef, useState } from 'react'
import { HelpDropDown, NotificationDropDown, OrgDropDown } from './OrgDropDown'
import { Folder, PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react'
import RenderSign from '../../utils/RenderSign';
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


const SearchResults = ({ icon, title, description, lnk }) => {
    return (
        <Link to={lnk} className='group flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-t border-white/5'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-dark-2 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110'>
                {icon}
            </div>
            <div className='flex flex-col min-w-0'>
                <span className='text-sm font-medium text-white truncate'>{title}</span>
                <span className='text-xs text-gray-500 truncate'>{description}</span>
            </div>
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
    const { getToken } = useAuth();
    const containerRef = useRef(null);


    useEffect(() => {
        const get = async () => {
            try {
                const token = await getToken();
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/protected/get-repos`, {
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
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/protected/get-shared-repos`, {
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
        <div className='sticky top-0 z-50 glass h-14 w-full flex justify-between items-center px-6 border-b border-white/5'>
            <div className='h-full flex items-center gap-2 cursor-pointer'>
                <p className='text-xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent'>Code Collab</p>
            </div>
            <div className='absolute left-1/2 transform -translate-x-1/2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl lg:w-[500px] flex flex-col transition-all duration-300'
                ref={containerRef}>
                <div className='flex items-center gap-3 w-full h-10 px-4'>
                    <Search size={18} className="text-gray-400" />
                    <input type="text" ref={SearchInput} className='w-full h-full bg-transparent border-none outline-none text-white placeholder:text-gray-500 text-sm' placeholder='Search projects...' onChange={(e) => setQuery(e.target.value)} value={query} onFocus={() => setOpen(true)}
                    />
                    <div className='hidden md:flex items-center gap-1 opacity-40'>
                        <span className='border border-white/20 text-[10px] px-1.5 py-0.5 rounded'>Ctrl</span>
                        <span className='border border-white/20 text-[10px] px-1.5 py-0.5 rounded'>K</span>
                    </div>
                </div>
                {/* Dropdown for search results */}
                {open && <ul>
                    <SearchResults icon={<Plus size={16} />} title="New" description="Create a New App" lnk={`http://localhost:5173/new`} />
                    <SearchResults icon={<Folder size={16} />} title="My Apps" description="Search your Apps" lnk={`http://localhost:5173/apps`} />
                </ul>}
                {/* {query} */}
                {open && !!query.length && <ul className='cursor-pointer'>
                    {filtered.map((item, i) => (
                        <SearchResults key={i} icon={<RenderSign language={item.language} />} title={item.repoName} description={getTimeAgo(item.createdAt)} lnk={`http://localhost:5173/editor/${item.vmId}`} />
                    ))}
                </ul>}
            </div>

            <div className='h-6 flex gap-2 items-center'>
                {/* <NotificationDropDown notifications={notifications} setNotifications={handleNotifications} /> */}
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