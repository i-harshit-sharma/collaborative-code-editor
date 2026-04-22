import React, { useState, useEffect, useRef } from 'react'
import RenderSign from '../../../utils/RenderSign'
import { ChevronDown, Earth, EllipsisVertical, Globe, Link2, Lock, LockKeyhole, Pen, Share2, Trash2, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, } from '../../ui/dropdown-menu'
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { frameworks } from '../../../utils/constants'
import { Combobox } from '../../../pages/New'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectPortal } from "../../ui/select";
import { Link } from 'react-router-dom'
import { Button } from "../../ui/button"
import { useUser } from '@clerk/clerk-react';
import Skeleton from '../../ui/Skeleton';


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
            setLoading(true);
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
            } finally {
                setLoading(false);
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
                {loading ? (
                    // Skeleton Cards
                    Array.from({ length: limit || 8 }).map((_, i) => (
                        <div key={i} className='flex flex-col bg-dark-3/50 border border-dark-1 rounded-2xl overflow-hidden p-6 gap-4'>
                            <Skeleton className="h-20 w-20 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="pt-4 border-t border-dark-1 mt-auto flex justify-between items-center">
                                <Skeleton className="h-6 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))
                ) : list.length === 0 ? (
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
            {/* Edit Dialog */}
            <Dialog open={edit !== null} onOpenChange={() => setEdit(null)}>
                <DialogContent className="sm:max-w-[425px] bg-dark-4 border-dark-2">
                    <DialogHeader>
                        <DialogTitle>Edit Repository</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-4'>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Repository Name</label>
                            <input
                                type='text'
                                placeholder='Repository Name'
                                className='bg-dark-2 border border-dark-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all'
                                ref={repoNameRef}
                                defaultValue={edit !== null ? list[edit].repoName : ""}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Language</label>
                            <Combobox 
                                onChange={(e) => setSelectedTemplate(e)} 
                                def={edit !== null ? list[edit].language : ""} 
                                disabled={true} 
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Visibility</label>
                            <Select
                                defaultValue={edit !== null ? list[edit].type : "Public"}
                                onValueChange={(value) => { if(typeRef.current) typeRef.current.value = value }}
                            >
                                <SelectTrigger className="w-full bg-dark-2 border-dark-1">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-4 border-dark-2">
                                    <SelectItem value="Public">Public</SelectItem>
                                    <SelectItem value="Private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <input type="hidden" ref={typeRef} defaultValue={edit !== null ? list[edit].type : "Public"} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button>
                        <Button onClick={() => handleEdit(list[edit]._id, { 
                            repoName: repoNameRef.current.value, 
                            language: list[edit].language, 
                            type: typeRef.current.value 
                        })}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={share !== null} onOpenChange={() => setShare(null)}>
                <DialogContent className="sm:max-w-[425px] bg-dark-4 border-dark-2">
                    <DialogHeader>
                        <DialogTitle>Share "{share !== null ? list[share].repoName : ""}"</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-4'>
                        <input 
                            type='email' 
                            className='w-full bg-dark-2 text-sm text-gray-200 outline-none p-2 rounded-lg border border-dark-1 focus:ring-1 focus:ring-primary' 
                            placeholder='Add people by email' 
                            ref={inputRef} 
                        />
                        <div className='flex items-center gap-3'>
                            <span className='text-sm text-gray-400'>Role:</span>
                            <Select value={userConf} onValueChange={setUserConf}>
                                <SelectTrigger className="w-32 bg-dark-2 border-dark-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-dark-4 border-dark-2">
                                    <SelectItem value="Editor">Editor</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 mt-2">
                            <h3 className='text-sm font-semibold text-gray-400'>People with Access</h3>
                            <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
                                {usersData?.sharedUsers.map((user, i) => (
                                    <div key={i} className='flex items-center justify-between p-2 rounded-lg bg-dark-2/50 border border-dark-1/50'>
                                        <div className='flex items-center gap-3'>
                                            <img src={user.raw.image_url} className='h-8 w-8 rounded-full border border-dark-1' />
                                            <div className='flex flex-col'>
                                                <span className='text-xs font-medium text-white'>{user.raw.first_name} {user.raw.last_name}</span>
                                                <span className='text-[10px] text-gray-400 truncate w-32'>{user.raw.email_addresses[0].email_address}</span>
                                            </div>
                                        </div>
                                        <span className='text-[10px] font-medium px-2 py-0.5 rounded-full bg-dark-3 text-gray-300'>{user.role}</span>
                                    </div>
                                ))}
                                {(!usersData || usersData.sharedUsers.length === 0) && (
                                    <p className="text-xs text-gray-500 italic">No one else has access yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mt-4 pt-4 border-t border-dark-1">
                            <h3 className='text-sm font-semibold text-gray-400'>General Access</h3>
                            <div className='flex items-center gap-3 p-2 rounded-lg bg-dark-2/30'>
                                {shareConfig[0] === "Restricted" ? <LockKeyhole className="text-gray-400 size-5" /> : <Earth className="text-green-400 size-5" />}
                                <div className='flex flex-col flex-1 gap-1'>
                                    <Select value={shareConfig[0]} onValueChange={(val) => setShareConfig([val, shareConfig[1]])}>
                                        <SelectTrigger className="h-7 text-xs bg-transparent border-none p-0 focus:ring-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Restricted">Restricted</SelectItem>
                                            <SelectItem value="Anyone with the Link">Anyone with the Link</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className='text-[10px] text-gray-500'>
                                        {shareConfig[0] === "Restricted" ? "Only people with access can open" : "Anyone with the link can view"}
                                    </span>
                                </div>
                                {shareConfig[0] !== "Restricted" && (
                                    <Select value={shareConfig[1]} onValueChange={(val) => setShareConfig([shareConfig[0], val])}>
                                        <SelectTrigger className="h-7 w-24 text-xs bg-dark-2 border-dark-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Viewer">Viewer</SelectItem>
                                            <SelectItem value="Editor">Editor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => {
                                const link = window.location.origin + "/editor/" + usersData?.vmId;
                                navigator.clipboard.writeText(link);
                            }}
                        >
                            <Link2 size={14} /> Copy Link
                        </Button>
                        <Button size="sm" onClick={() => handleShare(list[share]._id, { email: inputRef.current.value, shareConfig, role: userConf })}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteRepo !== null} onOpenChange={() => setDeleteRepo(null)}>
                <DialogContent className="sm:max-w-[425px] bg-dark-4 border-dark-2">
                    <DialogHeader>
                        <DialogTitle className="text-red-400">Delete Repository</DialogTitle>
                    </DialogHeader>
                    <div className='py-4 space-y-4'>
                        <p className='text-sm text-gray-400'>
                            This will permanently delete <span className="text-white font-semibold">"{deleteRepo !== null ? list[deleteRepo].repoName : ""}"</span>.
                            Please type the repository name to confirm.
                        </p>
                        <input 
                            type='text' 
                            className='w-full bg-dark-2 text-sm text-gray-200 outline-none p-2 rounded-lg border border-dark-1 focus:ring-1 focus:ring-destructive' 
                            placeholder='Type repo name here' 
                            ref={deleteRef} 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteRepo(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            if (deleteRef.current.value === list[deleteRepo].repoName) {
                                handleDelete(list[deleteRepo]._id);
                            }
                        }}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ProjectList