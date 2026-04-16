import React, { useState, useEffect, useRef } from 'react'
import RenderSign from '../../../utils/RenderSign'
import { ChevronDown, Earth, EllipsisVertical, Globe, Link2, Lock, LockKeyhole, Pen, Share2, Trash2, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuTrigger, } from '../../ui/dropdown-menu'
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Dialog } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import { frameworks } from '../../../utils/constants'
import { Combobox } from '../../../pages/New'
import { Select } from "radix-ui";
import { Link } from 'react-router-dom'
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@radix-ui/react-icons";
import classnames from "classnames";
import { useUser } from '@clerk/clerk-react';


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

const ProjectList = ({ limit, shared = false }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [edit, setEdit] = useState(null)
    const [share, setShare] = useState(null)
    const [deleteRepo, setDeleteRepo] = useState(null)
    const [list, setList] = useState([])
    const { getToken } = useAuth()
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const repoNameRef = useRef(null);
    const languageRef = useRef(null);
    const typeRef = useRef(null);
    const [usersData, setUsersData] = useState(null)
    const [shareConfig, setShareConfig] = useState(["Select an Option", "Select an Option"]);
    const inputRef = useRef(null)
    const [userConf, setUserConf] = useState("Viewer")
    const deleteRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const get = async () => {
            try {
                const token = await getToken();
                const endpoint = shared ? "/protected/get-shared-repos" : "/protected/get-repos";
                const response = await axios.get(`${apiUrl}${endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                setList(response.data);
            } catch (error) {
                console.error("Error fetching repos:", error);
            }
        }
        get()
    }, [shared])

    const handleEdit = async (id, obj) => {
        try {
            const token = await getToken()
            const response = await axios.post(`${apiUrl}/protected/edit-repo`,
                { id, obj },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                })
            setList(response.data.user.repos)
        } catch (error) {
            console.error("Error editing repo:", error);
        }
        setEdit(null)
    };

    const getSharedUsers = async (id) => {
        try {

            const token = await getToken();
            const response = await axios.get(`${apiUrl}/protected/get-shared-users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            console.log(response.data);
            setUsersData(response.data);
            setShareConfig((prev) => {
                if (!prev) {
                    return [response.data.access, response.data.action];
                }
                return [response.data.access, response.data.action];
            });

        } catch (error) {
            console.error(error);
        }
    }

    const SelectItem = React.forwardRef(
        ({ children, className, ...props }, forwardedRef) => {
            return (
                <Select.Item
                    className={classnames("SelectItem", className)}
                    {...props}
                    ref={forwardedRef}
                >
                    <Select.ItemText>{children}</Select.ItemText>
                    <Select.ItemIndicator className="SelectItemIndicator">
                        <CheckIcon />
                    </Select.ItemIndicator>
                </Select.Item>
            );
        },
    );


    const handleShare = (id, obj) => {
        try {
            const get = async () => {
                const token = await getToken()
                const response = await axios.post(`${apiUrl}/protected/share-repo`,
                    { id, obj },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                    })
                setList(response.data.user.repos)
            }
            get();
        } catch (error) {
            console.error(error);
        }
        setShare(null)
    }

    const handleDelete = async (id) => {
        try {
            const token = await getToken()
            await axios.delete(`${apiUrl}/protected/delete-repo/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });
            setList(prevList => prevList.filter(repo => repo._id !== id));
        } catch (error) {
            console.error(error);
        }
        finally {
            setDeleteRepo(null)
        }
    }

    // TODO: get shared users, Add shared users

    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 my-6 w-full'>
                {list.length === 0 ? (
                    <div className='col-span-full text-gray-500 text-center py-20 bg-dark-3/30 rounded-2xl border-2 border-dashed border-dark-1'>
                        No Projects Found
                    </div>
                ) : (list.slice(0, limit).map((item, index) => {
                    return (
                        <div key={index} className='group relative flex flex-col bg-dark-3 border border-dark-1 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1'>
                            {/* Status/Environment Header */}
                            <div className="absolute top-4 left-4 z-10">
                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-dark-4/60 backdrop-blur-sm border border-dark-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Online
                                </div>
                            </div>

                            <Link to={`/editor/${item.vmId}`} className='p-6 flex-grow'>
                                <div className='mb-6 mt-4 flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-dark-2 to-dark-4 border border-dark-1 group-hover:scale-110 transition-transform duration-300'>
                                    <RenderSign language={item.language} size={40} />
                                </div>

                                <div className='space-y-1'>
                                    <h3 className='text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors'>
                                        {item.repoName}
                                    </h3>
                                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                                        <span className="capitalize">{item.language}</span>
                                        <span>•</span>
                                        <span>{getTimeAgo(item.createdAt)}</span>
                                    </div>
                                </div>
                            </Link>

                            <div className='px-6 py-4 flex items-center justify-between border-t border-dark-1 bg-dark-4/50'>
                                <div className='flex items-center gap-2 px-2 py-1 rounded-lg bg-dark-2 border border-dark-1 text-xs text-gray-300'>
                                    {item.type === "Public" ? <Globe size={14} /> : <Lock size={14} />}
                                    {item.type}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 hover:bg-dark-1 rounded-lg transition-colors text-gray-400 hover:text-white outline-none">
                                            <EllipsisVertical size={20} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48 bg-dark-4 border-dark-1 p-1 shadow-2xl z-[100]" scrollbar="false" sideOffset={8}>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-dark-1 focus:bg-dark-1 transition-colors text-sm text-gray-200" onClick={() => setEdit(index)}>
                                                <Pen size={16} /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-dark-1 focus:bg-dark-1 transition-colors text-sm text-gray-200" onClick={() => { setShare(index); getSharedUsers(item._id) }}>
                                                <Share2 size={16} /> Share
                                            </DropdownMenuItem>
                                            <div className="h-px bg-dark-1 my-1"></div>
                                            <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 transition-colors text-sm text-red-400" onClick={() => setDeleteRepo(index)}>
                                                <Trash2 size={16} /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )
                }))}
            </div>
                    {edit !== null && (
                        <div className="fixed inset-0 bg-dark-4/25 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-dark-4 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
                                <section className='w-full flex flex-col items-center justify-center mt-4'>
                                    <h2 className='text-lg font-semibold mb-2'>Edit the Repository</h2>
                                    <div className='flex flex-col gap-4 w-full'>
                                        <input
                                            type='text'
                                            placeholder='Repository Name'
                                            className='border border-dark-1 px-2 py-1.5 rounded focus-visible:outline-0 focus:border-blue-500 text-sm '
                                            ref={repoNameRef}
                                            defaultValue={list[edit].repoName}
                                        />
                                        <Combobox onChange={(e) => setSelectedTemplate(e)} def={list[edit].language} disabled={true} />
                                        {
                                            selectedTemplate && (
                                                <div className='w-full mt-3 p-3 rounded border border-dark-1'>
                                                    <div className='flex justify-between items-center'>
                                                        <RenderSign language={frameworks.find((fw) => fw.value === selectedTemplate)?.language} size={32} />
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
                                        <select
                                            className="border border-dark-1 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-1 transition duration-200 bg-dark-4"
                                            defaultValue={list[edit].type}
                                            ref={typeRef}
                                        >
                                            <option value="Public" className=" text-white ">Public</option>
                                            <option value="Private" className=" text-white ">Private</option>
                                        </select>
                                        <div className='flex justify-between'>

                                            <button
                                                className='bg-blue-1 text-white px-1.5 py-1 rounded hover:bg-blue-600 cursor-pointer'
                                                onClick={() => handleEdit(list[edit]._id, { repoName: repoNameRef.current.value, language: list[edit].language, type: typeRef.current.value })}
                                            >
                                                Save
                                            </button>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => setEdit(null)}
                                                    className="px-4 py-1 bg-dark-3 text-white rounded hover:bg-dark-2 cursor-pointer transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={() => setEdit(null)}
                                ><X size={24} color='#ddd' /></button>
                            </div>
                        </div>
                    )}
                    {share !== null && (
                        <div className="fixed inset-0 bg-dark-4/25 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-dark-4 rounded-2xl shadow-xl p-6 w-full max-w-md relative">
                                <h1 className='text-xl'>Share "{list[share].repoName}"</h1>
                                <input type='email ' className='w-full bg-dark-2 text-sm my-3 text-gray-200 outline-0 ring-0 p-1.5 border border-dark-1' placeholder='Add people' ref={inputRef} />
                                <div className='flex gap-4 items-center'>
                                    <div className='text-sm'>Role : </div>
                                    <Select.Root
                                        value={userConf}
                                        onValueChange={(value) =>
                                            setUserConf(value)
                                        }
                                    >
                                        <Select.Trigger className="SelectTrigger focus-visible:ring-0 outline-0 rounded hover:bg-dark-2 " aria-label="Food">
                                            <Select.Value placeholder="Select a fruit…" />
                                            <Select.Icon className="SelectIcon">
                                                <ChevronDownIcon />
                                            </Select.Icon>
                                        </Select.Trigger>
                                        <Select.Portal>
                                            <Select.Content className="SelectContent absolute z-64">
                                                <Select.ScrollUpButton className="SelectScrollButton">
                                                    <ChevronUpIcon />
                                                </Select.ScrollUpButton>
                                                <Select.Viewport className="SelectViewport w-28">
                                                    <Select.Group>
                                                        <SelectItem value="Editor">Editor</SelectItem>
                                                        <SelectItem value="Viewer">
                                                            Viewer
                                                        </SelectItem>
                                                    </Select.Group>

                                                </Select.Viewport>
                                                <Select.ScrollDownButton className="SelectScrollButton">
                                                    <ChevronDownIcon />
                                                </Select.ScrollDownButton>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                </div>
                                <h1 className='text-base mt-3 mb-1'>People with Access</h1>
                                {usersData &&
                                    usersData?.sharedUsers.map((user) => {
                                        return (
                                            <div className='flex items-center mt-2 hover:bg-dark-1 p-2 rounded text-white w-full justify-between'>
                                                <div className='gap-3 flex items-center'>
                                                    <img src={user.raw.image_url} className='h-10 rounded-full ' />
                                                    <div className='flex flex-col'>
                                                        <span className='text-sm'>{user.raw.first_name + ' ' + user.raw.last_name}</span>
                                                        <span className='text-sm'>{user.raw.email_addresses[0].email_address}</span>
                                                    </div>
                                                </div>
                                                <div className='justify-self-end text-sm'>{user.role}</div>
                                            </div>)
                                    })}
                                <h1 className='text-cl'>General Access</h1>
                                <div className='flex gap-2 items-center mt-2 px-3'>
                                    {usersData &&
                                        shareConfig[0] === "Restricted" ? <LockKeyhole /> : <Earth color='#c9ffe5' />
                                    }
                                    {usersData &&
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-sm'>
                                                <Select.Root
                                                    value={shareConfig[0]}
                                                    onValueChange={(value) =>
                                                        setShareConfig((prev) => [value, prev[1]])
                                                    }
                                                >
                                                    <Select.Trigger className="SelectTrigger focus-visible:ring-0 outline-0 rounded hover:bg-dark-2 " aria-label="Food">
                                                        <Select.Value placeholder="Select a fruit…" />
                                                        <Select.Icon className="SelectIcon">
                                                            <ChevronDownIcon />
                                                        </Select.Icon>
                                                    </Select.Trigger>
                                                    <Select.Portal>
                                                        <Select.Content className="SelectContent absolute z-64">
                                                            <Select.ScrollUpButton className="SelectScrollButton">
                                                                <ChevronUpIcon />
                                                            </Select.ScrollUpButton>
                                                            <Select.Viewport className="SelectViewport w-48">
                                                                <Select.Group>
                                                                    <SelectItem value="Restricted">Restricted</SelectItem>
                                                                    <SelectItem value="Anyone with the Link">
                                                                        Anyone with the Link
                                                                    </SelectItem>
                                                                </Select.Group>

                                                            </Select.Viewport>
                                                            <Select.ScrollDownButton className="SelectScrollButton">
                                                                <ChevronDownIcon />
                                                            </Select.ScrollDownButton>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            </span>
                                            {shareConfig[0] === "Restricted" ? <span className='text-xs'>Only people with access can open with the link</span> : <span className='text-xs'>Anyone on the internet with the link can view</span>}

                                        </div>
                                    }
                                    {usersData && shareConfig[0] !== "Restricted" &&
                                        <div className='flex flex-col gap-1'>
                                            <span className='text-sm'>
                                                <Select.Root
                                                    value={shareConfig[1]}
                                                    onValueChange={(value) =>
                                                        setShareConfig((prev) => [prev[0], value])
                                                    }
                                                >
                                                    <Select.Trigger className="SelectTrigger focus-visible:ring-0 outline-0 rounded hover:bg-dark-2 " aria-label="Food">
                                                        <Select.Value placeholder="Select a fruit…" />
                                                        <Select.Icon className="SelectIcon">
                                                            <ChevronDownIcon />
                                                        </Select.Icon>
                                                    </Select.Trigger>
                                                    <Select.Portal>
                                                        <Select.Content className="SelectContent absolute z-64">
                                                            <Select.ScrollUpButton className="SelectScrollButton">
                                                                <ChevronUpIcon />
                                                            </Select.ScrollUpButton>
                                                            <Select.Viewport className="SelectViewport w-48">
                                                                <Select.Group>
                                                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                                                    <SelectItem value="Editor">Editor</SelectItem>
                                                                </Select.Group>

                                                            </Select.Viewport>
                                                            <Select.ScrollDownButton className="SelectScrollButton">
                                                                <ChevronDownIcon />
                                                            </Select.ScrollDownButton>
                                                        </Select.Content>
                                                    </Select.Portal>
                                                </Select.Root>
                                            </span>
                                        </div>
                                    }
                                </div>
                                <div className='flex items-center justify-between mt-4'>
                                    <span className='flex items-center gap-2 border rounded py-1 px-3 hover:border-blue-1 border-dark-1' onClick={() => {
                                        const link = "http://" + "localhost:5173" + "/editor/" + usersData.vmId;
                                        navigator.clipboard.writeText(link)
                                            .then(() => {
                                                console.log("Link copied to clipboard!");
                                            })
                                            .catch(err => {
                                                console.error("Failed to copy: ", err);
                                            });
                                    }}>
                                        <Link2 size={18} />
                                        Copy Link
                                    </span>
                                    <span className='border border-dark-1 rounded bg-blue-1 px-3 py-1' onClick={() => { handleShare(list[share]._id, { email: inputRef.current.value, shareConfig, role: userConf }) }}>
                                        Done
                                    </span>
                                </div>
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={() => setShare(null)}
                                ><X size={24} color='#ddd' /></button>
                            </div>
                        </div>
                    )}
                    {deleteRepo !== null && (
                        <div className="fixed inset-0 bg-dark-4/25 bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-dark-4 rounded-2xl shadow-xl p-6 max-w-md relative  w-full">
                                <h1 className='text-xl'>Delete "{list[deleteRepo].repoName}"</h1>
                                <p className='text-sm text-gray-400'>Are you sure you want to delete this repository? This action cannot be undone.</p>
                                <input type='text' className='w-full bg-dark-2 text-sm my-3 text-gray-200 outline-0 ring-0 p-1.5 border border-dark-1' placeholder='Type Repository name to confirm' ref={deleteRef} />
                                <div className='flex items-center justify-between gap-2 ' >
                                    <button className='bg-red-500 px-2 rounded py-1 flex-1'
                                        onClick={() => {
                                            if (deleteRef.current.value === list[deleteRepo].repoName) {
                                                handleDelete(list[deleteRepo]._id)
                                            }
                                            else {
                                                setDeleteRepo(null)
                                            }
                                        }}
                                    >Delete</button>
                                    <button className='bg-dark-1 px-2 rounded py-1 flex-1'
                                        onClick={() => setDeleteRepo(null)}>Cancel
                                    </button>
                                </div>
                                <button
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    onClick={() => setDeleteRepo(null)}
                                ><X size={24} color='#ddd' /></button>
                            </div>
                        </div>
                    )}
        </>
    )
}

export default ProjectList