import React, { useEffect, useRef, useState } from 'react'
import { HelpDropDown, NotificationDropDown, OrgDropDown } from './OrgDropDown'
import { Folder, PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react'
import RenderSign from '../utils/RenderSign';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { UserButton } from '@clerk/clerk-react'

const data = [
    {
        language: "React",
        title: "mailmehere090/OutrageousMemorableTransformations",
        description: "edited 2 days ago",
    },
    {
        language: "HTML",
        title: "mailmehere090/Animations",
        description: "edited 3 months ago",
    },
    {
        language: "Node",
        title: "mailmehere090/Node.js",
        description: "edited 4 months ago",
    },
    {
        language: "Python",
        title: "mailmehere090/DataScienceProjects",
        description: "edited 1 week ago",
    },
]

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


const SearchResults = ({ icon, title, description, }) => {
    return (
        <div className='group flex flex-start hover:bg-dark-2 py-1.5 items-center gap-2 px-2 border-t-2 border-t-dark-2/40 cursor-pointer'>
            <div className='flex min-w-fit justify-center items-center bg-dark-2 group-hover:bg-[#063b72] px-2 py-1 rounded gap-1 transition-colors'>
                <span>{icon}</span>
                <span className='text-sm select-none'>{title}</span>
            </div>
            <div className='text-nowrap text-xs overflow-hidden select-none'>{description}</div>
        </div>
    );
};


const Navbar = ({ isOpen, toggleNavbar }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false)
    const SearchInput = useRef(null);
    const [notifications, setNotifications] = useState(notificationsArray);
    const handleNotifications = (index) => {
        const newNotifications = [...notifications];
        newNotifications[index].status = "read";
        setNotifications(newNotifications);
    };

    const filtered = data.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
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
                <p className='text-xl font-bold ml-2'>Code Together</p>
            </div>
            <div className=' border-1 border-dark-2 absolute top-2 left-1/2 transform -translate-x-1/2 bg-dark-4 rounded-sm lg:w-[530px] flex flex-col'>
                <div className='flex items-center gap-2 w-full h-full px-2'>
                    <Search size={20} />
                    <input type="text" ref={SearchInput} className='w-full h-full bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-300 text-sm hover:text-gray-50' placeholder='Search...' onChange={(e) => setQuery(e.target.value)} value={query} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
                    />
                    <div className='p-1'>
                        <span className='border-1 text-sm border-dark-2 px-1 rounded'>Ctrl</span>
                        &nbsp;
                        <span className='border-1 text-sm border-dark-2 px-1 rounded'>K</span>
                    </div>
                </div>
                {/* Dropdown for search results */}
                {open && <ul>
                    <SearchResults icon={<Plus size={16} />} title="New" description="Create a New App" />
                    <SearchResults icon={<Folder size={16} />} title="My Apps" description="Search your Apps" />
                </ul>}
                {open && !!query.length && <ul className='cursor-pointer'>
                    {filtered.map((item, i) => (
                        <SearchResults key={i} icon={<RenderSign language={item.language} />} title={item.title} description={item.description} />
                    ))}
                </ul>}
            </div>

            <div className='h-6 flex gap-2 items-center'>
                <NotificationDropDown notifications={notifications} setNotifications={handleNotifications} />
                <div className='p-1.5 hover:bg-dark-1 rounded cursor-pointer'>
                    <HelpDropDown />
                </div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </div>
    )
}

export default Navbar