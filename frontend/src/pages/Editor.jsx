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
const Whiteboard = React.lazy(() => import('../components/features/editor/Whiteboard'));
const Chat = React.lazy(() => import('../components/features/chat/Chat'));
import SearchL from '../components/features/dashboard/Search';
import Share from '../components/features/collaboration/Share';
import PortManager from '../components/features/editor/PortManager';
import Skeleton from '../components/ui/Skeleton';

const ResizableLayout = ({ showSidebar, sidebarValue }) => {
    const { id: roomId } = useParams();
    const { getToken } = useAuth();
    const containerRef = useRef(null);
    const isResizingRef = useRef(null);
    const mainRef = useRef(null);
    const [filedata, setFiledata] = useState('');
    const [socket, setSocket] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [topHeight, setTopHeight] = useState(window.innerHeight - 300);
    const [activePath, setActivePath] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [saveStatuses, setSaveStatuses] = useState({}); // { [path]: 'saved' | 'saving' | 'unsaved' }
    const [vmMetadata, setVmMetadata] = useState(null);
    const [explorerError, setExplorerError] = useState(null);
    const [isExplorerLoading, setIsExplorerLoading] = useState(true);

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
        let refreshInterval;
        let socketInstance;

        const initSocket = async () => {
            const token = await getToken();
            
            socketInstance = io(socketUrl, {
                auth: { token },
                transports: ['websocket']
            });
            
            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                console.log('🔌 Connected to socket server');
                socketInstance.emit('join-room', { roomId });
                socketInstance.emit('getFiles', { path: '/app', id: roomId });
            });

            socketInstance.on('error', (err) => {
                console.error('Socket error:', err);
                if (err === 'Session expired') {
                    // Force re-auth
                    getToken({ skipCache: true }).then(newToken => {
                        socketInstance.emit('authenticate', { token: newToken });
                    });
                }
            });

            // Keep token fresh (Clerk tokens expire in 60s)
            refreshInterval = setInterval(async () => {
                try {
                    const newToken = await getToken({ skipCache: true });
                    socketInstance.emit('authenticate', { token: newToken });
                } catch (err) {
                    console.error('Failed to refresh socket token:', err);
                }
            }, 45000); // Refresh every 45s
        };

        initSocket();

        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
            socketInstance?.disconnect();
            setSocket(null);
        };
    }, [roomId, getToken]);

    useEffect(() => {
        if (!socket) return;

        let loadingTimeout = setTimeout(() => {
            setExplorerError("Connection timeout. Please refresh or check your internet.");
            setIsExplorerLoading(false);
        }, 10000); // 10s timeout

        const handleFilesReady = () => {
            socket.emit('getFiles', { path: '/app', id: roomId });
        };

        const handleFiles = (data) => {
            clearTimeout(loadingTimeout);
            setIsExplorerLoading(false);
            if (data.error) {
                console.error('File fetch error:', data.error);
                setExplorerError(`Failed to load files: ${data.error}`);
                return;
            }
            if (data.tree) {
                setFiledata(data.tree);
                setExplorerError(null);
            }
        };

        const handleFileContent = (data) => {
            if (data.error) {
                console.error('Failed to open file:', data.error);
                return;
            }
            const { path, content } = data;
            if (!path) return;
            
            setTabs(prev => {
                const found = prev.find(t => t.path === path);
                if (found) {
                    return prev.map(t => t.path === path ? { ...t, content } : t);
                }
                return [...prev, { path, content }];
            });
            setSaveStatuses(prev => ({ ...prev, [path]: 'saved' }));
            setActivePath(path);
        };

        socket.on('filesReady', handleFilesReady);
        socket.on('files', handleFiles);
        socket.on('fileContent', handleFileContent);

        return () => {
            clearTimeout(loadingTimeout);
            socket.off('filesReady', handleFilesReady);
            socket.off('files', handleFiles);
            socket.off('fileContent', handleFileContent);
        };
    }, [roomId, socket]);

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
                        {sidebarValue === 'explorer' && (
                            explorerError ? (
                                <div className="p-4 text-center">
                                    <p className="text-red-400 text-sm mb-3">{explorerError}</p>
                                    <button 
                                        onClick={() => {
                                            setExplorerError(null);
                                            setIsExplorerLoading(true);
                                            socket?.emit('getFiles', { path: '/app', id: roomId });
                                        }}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : filedata ? (
                                <FileExplorer data={filedata} socket={socket} activePath={activePath} width={sidebarWidth} role={vmMetadata?.role} />
                            ) : (
                                <div className="flex flex-col gap-3 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <Skeleton className="h-4 w-20" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-5 w-5 rounded" />
                                            <Skeleton className="h-5 w-5 rounded" />
                                        </div>
                                    </div>
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i % 3) * 12}px` }}>
                                            <Skeleton className="h-4 w-4 rounded-sm" />
                                            <Skeleton className={`h-3 rounded-sm ${i % 4 === 0 ? 'w-24' : i % 4 === 1 ? 'w-32' : i % 4 === 2 ? 'w-20' : 'w-28'}`} />
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                        {sidebarValue === 'search' && <SearchL socket={socket} />}
                        {sidebarValue === 'share' && <Share />}
                        {sidebarValue === 'chat' && (
                            <React.Suspense fallback={<div className="p-4 text-gray-400">Loading Chat...</div>}>
                                <Chat socket={socket} roomId={roomId} />
                            </React.Suspense>
                        )}
                        {sidebarValue === 'draw' && (
                            <React.Suspense fallback={<div className="p-4 text-gray-400">Loading Whiteboard...</div>}>
                                <Whiteboard />
                            </React.Suspense>
                        )}
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
                <div style={{ height: vmMetadata?.role === 'Viewer' ? '100%' : topHeight }} className="flex-1 relative">
                    {sidebarValue === 'draw' ? (
                        <React.Suspense fallback={<div className="flex-1 flex items-center justify-center bg-dark-4 text-gray-400">Loading Whiteboard...</div>}>
                            <Whiteboard />
                        </React.Suspense>
                    ) : (
                        <EditorContainer 
                            socket={socket} 
                            activePath={activePath} 
                            setActivePath={setActivePath} 
                            tabs={tabs}
                            setTabs={setTabs}
                            saveStatuses={saveStatuses}
                            setSaveStatuses={setSaveStatuses}
                            role={vmMetadata?.role}
                        />
                    )}
                </div>

                {/* Terminal Resizer */}
                {vmMetadata?.role !== 'Viewer' && (
                    <div onMouseDown={handleMouseDown('terminal')} className="h-1 bg-gray-800 hover:bg-blue-600 cursor-row-resize transition-colors" />
                )}

                {/* Terminal Pane */}
                {vmMetadata?.role !== 'Viewer' && (
                    <div className="flex-none h-[300px] bg-dark-4">
                        <TerminalPane containerId={roomId} socket={socket} />
                    </div>
                )}
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
