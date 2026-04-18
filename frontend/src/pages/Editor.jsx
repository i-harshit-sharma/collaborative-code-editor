import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Files, MessageCircle, Pen, Search, Share2, Globe } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import Split from 'react-split';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import FileExplorer from '../components/features/editor/FileExplorer';
import EditorContainer from '../components/features/editor/EditorContainer';
import TerminalPane from '../components/features/editor/TerminalPane';
import Whiteboard from '../components/features/editor/Whiteboard';
import Chat from '../components/features/chat/Chat';
import SearchL from '../components/features/dashboard/Search';
import Share from '../components/features/collaboration/Share';
import PortManager from '../components/features/editor/PortManager';

const ResizableLayout = ({ showSidebar, sidebarValue }) => {
    const { id: roomId } = useParams();
    const { getToken } = useAuth();
    const containerRef = useRef(null);
    const isResizingRef = useRef(null);
    const mainRef = useRef(null);
    const [filedata, setFiledata] = useState('');
    const socketRef = useRef(null);
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [topHeight, setTopHeight] = useState(window.innerHeight - 300);
    const [activePath, setActivePath] = useState(null);
    const [vmMetadata, setVmMetadata] = useState(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const token = await getToken();
                const baseUrl = import.meta.env.VITE_API_BASE_URL;
                const response = await fetch(`${baseUrl}/protected/vm-metadata/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setVmMetadata(data);
                }
            } catch (err) {
                console.error('Failed to fetch VM metadata:', err);
            }
        };

        if (roomId) fetchMetadata();
    }, [roomId, getToken]);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_BASE_URL;
        socketRef.current = io(socketUrl);
        
        // Join the room and identify immediately
        const joinRoom = async () => {
            try {
                const token = await getToken();
                socketRef.current.emit('join-room', { token, roomId });
                socketRef.current.emit('getFiles', { path: '/app', id: roomId });
            } catch (err) {
                console.error('Failed to join room:', err);
            }
        };

        socketRef.current.on('connect', joinRoom);

        // Cleanup
        return () => {
            socketRef.current?.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        if (!socketRef.current) return;
        const socket = socketRef.current;

        const handleFilesReady = () => {
            socket.emit('getFiles', { path: '/app', id: roomId });
        };

        const handleFiles = (data) => {
            if (data.tree) {
                setFiledata(data.tree);
            }
        };

        socket.on('filesReady', handleFilesReady);
        socket.on('files', handleFiles);

        return () => {
            socket.off('filesReady', handleFilesReady);
            socket.off('files', handleFiles);
        };
    }, [roomId]);
    const handleMouseDown = (resizer) => (e) => {
        isResizingRef.current = resizer;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizingRef.current) return;
        if (isResizingRef.current === 'sidebar') {
            setSidebarWidth(Math.max(e.clientX - 64, 150));
        } else if (isResizingRef.current === 'terminal') {
            setTopHeight(Math.max(e.clientY - 40, 100));
        }
    };

    const handleMouseUp = () => {
        isResizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div ref={containerRef} className="flex flex-1 h-screen overflow-hidden bg-dark-4">
            {/* Sidebar Content */}
            {showSidebar && (
                <div style={{ width: sidebarWidth }} className="bg-dark-3 flex flex-col border-r border-gray-800">
                    <div className="flex-1 overflow-hidden">
                        {sidebarValue === 'explorer' && filedata && <FileExplorer data={filedata} socket={socketRef.current} activePath={activePath} />}
                        {sidebarValue === 'search' && <SearchL socket={socketRef.current} />}
                        {sidebarValue === 'share' && <Share />}
                        {sidebarValue === 'chat' && <Chat socket={socketRef.current} roomId={roomId} />}
                        {sidebarValue === 'draw' && <Whiteboard />}
                        {sidebarValue === 'ports' && (
                            <PortManager 
                                vmId={roomId} 
                                defaultPorts={vmMetadata?.defaultPorts} 
                            />
                        )}

                    </div>
                </div>
            )}
            
            {/* Sidebar Resizer */}
            {showSidebar && (
                <div onMouseDown={handleMouseDown('sidebar')} className="w-1 bg-gray-800 hover:bg-blue-600 cursor-col-resize transition-colors" />
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div style={{ height: topHeight }} className="flex-1 relative">
                    {sidebarValue === 'draw' ? <Whiteboard /> : <EditorContainer socket={socketRef.current} activePath={activePath} setActivePath={setActivePath} />}
                </div>

                {/* Terminal Resizer */}
                <div onMouseDown={handleMouseDown('terminal')} className="h-1 bg-gray-800 hover:bg-blue-600 cursor-row-resize transition-colors" />

                {/* Terminal Pane */}
                <div className="flex-none h-[300px] bg-dark-4">
                    <TerminalPane containerId={roomId} socket={socketRef.current} />
                </div>
            </div>
        </div>
    );
};

const Editor = () => {
    const { id } = useParams();
    const [sidebarValue, setSidebarValue] = useState("explorer");
    const [showSidebar, setShowSidebar] = useState(true);

    const sidebarIcons = [
        { icon: <Files size={24} />, name: "explorer" },
        { icon: <Search size={24} />, name: "search" },
        { icon: <Share2 size={24} />, name: "share" },
        { icon: <MessageCircle size={24} />, name: "chat" },
        { icon: <Pen size={24} />, name: "draw" },
        { icon: <Globe size={24} />, name: "ports" },
    ];


    return (
        <div className="w-screen h-screen flex flex-row overflow-hidden bg-dark-4 text-gray-300">
            {/* Left Activity Bar */}
            <div className="bg-dark-2 w-16 flex flex-col justify-between items-center py-4 border-r border-gray-800">
                <div className="flex flex-col gap-6">
                    {sidebarIcons.map((item, i) => (
                        <div 
                            key={i} 
                            className={`p-2 rounded-lg cursor-pointer transition-all ${sidebarValue === item.name && showSidebar ? 'bg-dark-1 text-white shadow-lg' : 'hover:bg-dark-1 hover:text-white'}`} 
                            onClick={() => {
                                if (sidebarValue === item.name) setShowSidebar(!showSidebar);
                                else {
                                    setSidebarValue(item.name);
                                    setShowSidebar(true);
                                }
                            }}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <SignedIn><UserButton /></SignedIn>
                    <SignedOut><SignInButton /></SignedOut>
                </div>
            </div>

            <ResizableLayout sidebarValue={sidebarValue} showSidebar={showSidebar} />
        </div>
    );
};

export default Editor;
