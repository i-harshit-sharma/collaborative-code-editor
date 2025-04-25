import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { ArrowDownToLine, ArrowUpFromLine, Files, GitPullRequest, MessageCircle, Pen, Phone, Search, Settings, Share2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import Split from 'react-split';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import FileExplorer from '../components/FileExplorer';
import EditorContainer from '../components/EditorContainer';
import TerminalPane from '../components/TerminalPane';
import Whiteboard from '../components/Whiteboard';
import Chat from '../components/Chat';
import SearchL from '../components/Search';
import Share from '../components/Share';
import TestEditor from './TestEditor';
/**
 * Renders a tabbed interface to switch between multiple terminals.
 * You can add new tabs, switch between them, and close existing ones.
 */
function TerminalSwitcher() {
    // Initial list of terminal IDs
    const initialTerms = ['shell-1', 'shell-2', 'shell-3'];
    const [terminals, setTerminals] = useState(initialTerms);
    const [activeId, setActiveId] = useState(initialTerms[0]);

    // Create a new unique terminal ID and activate it
    const addTerminal = () => {
        const newId = `shell-${Date.now()}`;
        setTerminals((prev) => [...prev, newId]);
        setActiveId(newId);
    };

    // Remove a terminal; if it was active, switch to another one
    const removeTerminal = (id) => {
        setTerminals((prev) => prev.filter((tid) => tid !== id));
        if (activeId === id) {
            const remaining = terminals.filter((tid) => tid !== id);
            setActiveId(remaining.length ? remaining[0] : null);
        }
    };

    // Render nothing if no terminals are left
    if (!activeId) {
        return (
            <div className="p-4">
                <p className="mb-4">No terminals open.</p>
                <button
                    onClick={addTerminal}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
                >
                    Open New Terminal
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Tab Bar */}
            <div className="flex items-center space-x-2 bg-gray-800 p-2">
                {terminals.map((id) => (
                    <div
                        key={id}
                        className={`flex items-center space-x-1 px-3 py-1 rounded cursor-pointer \
              ${activeId === id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        onClick={() => setActiveId(id)}
                    >
                        <span className="text-sm">{id}</span>
                        <button
                            className="text-xs font-bold"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTerminal(id);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={addTerminal}
                    className="ml-auto px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-sm"
                >
                    + New
                </button>
            </div>

            {/* Active Terminal Pane */}
            <div className="flex-1 overflow-hidden">
                <TerminalPane id={activeId} />
            </div>
        </div>
    );
}


const ResizableLayout = ({ showSidebar, sidebarValue }) => {
    const id = useParams().id;
    const { getToken } = useAuth();
    const containerRef = useRef(null);
    const isResizingRef = useRef(null);
    const mainRef = useRef(null);
    const terminalRef = useRef(null);
    const [filedata, setFiledata] = useState('');
    const [terminalData, setTerminalData] = useState([0, 1]);
    const [terminalValue, setTerminalValue] = useState(0);

    const socketRef = useRef(null);
    const xterm = useRef(null);
    const fitAddon = useRef(null);

    const [data, setData] = useState([]);
    const [change, setChange] = useState();
    const [sidebarWidth, setSidebarWidth] = useState(200);
    const [topHeight2, setTopHeight2] = useState(571);

    const addTerminal = () => {
        setTerminalData(prev => [...prev, terminalData.length + 1]);
        setTerminalValue(prev => prev + 1);
    };

    const removeTerminal = (id) => {
        setTerminalData((prev) => prev.filter(editorId => editorId !== id));
        if (terminalValue === id) {
            setTerminalValue(prevTabs => prevTabs.length > 1 ? prevTabs[0] : null);
        }
    };

    useEffect(() => {
        // Initialize xterm and addons
        xterm.current = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
            },
        });

        socketRef.current = io('http://localhost:4000');
        fitAddon.current = new FitAddon();
        xterm.current.loadAddon(fitAddon.current);

        if (terminalRef.current) {
            xterm.current.open(terminalRef.current);
            setTimeout(() => fitAddon.current.fit(), 0); // fit after mount
        }

        // Resize observer
        const observer = new ResizeObserver(() => {
            fitAddon.current?.fit();
        });
        if (terminalRef.current) {
            observer.observe(terminalRef.current);
        }

        // Initialize socket

        xterm.current.onData(data => {
            socketRef.current.emit('input', data);
        });

        socketRef.current.on('output', ({ data }) => {
            // console.log('Received data from server:', data);
            xterm.current.write(data);
        });

        // Token sending on server request
        socketRef.current.on('sendToken', () => {
            console.log('Sending token to server...');
            (async () => {
                try {
                    const token = await getToken();
                    socketRef.current.emit('sendToken', { token, containerId: id });
                } catch (err) {
                    console.error('Token fetch error:', err);
                }
            })();
        });

        // Warn server on page unload
        const handleBeforeUnload = () => {
            socketRef.current.emit('output', 'Page is being refreshed or changed');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            xterm.current?.dispose();
            socketRef.current?.disconnect();
            observer.disconnect();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const send = io('http://localhost:4000')

    useEffect(() => {
        const path = '/app';
        console.log('Getting files from path:', path);
        send.on('filesReady', data => {
            send.emit('getFiles', { path, id });
            send.on('files', data => {
                // console.log('Received files:', data.files);
                const tree = buildFileTree(data.files);
                console.log('Parsed tree:', tree);
                setFiledata(tree);
            });
        })
    }, [socketRef]);

    function buildFileTree(lines) {
        let idCounter = 1;
        const createId = () => (idCounter++).toString();

        const pathMap = {};
        const rootChildren = [];

        const isPathLine = line => /^\/.*:$/.test(line);
        const getFullPath = (base, name) =>
            base.endsWith("/") ? base + name : base + "/" + name;

        let currentPath = "/app";

        // === First Pass: Create all folders ===
        for (const line of lines) {
            if (!line.trim()) continue;

            if (isPathLine(line)) {
                currentPath = line.replace(/:$/, "");
                if (!pathMap[currentPath]) {
                    const parts = currentPath.split("/").filter(Boolean);
                    let tempPath = "";
                    let parentChildren = rootChildren;

                    for (const part of parts) {
                        if (part === "." || part === "..") continue; // ignore
                        tempPath = getFullPath(tempPath || "/", part);
                        if (!pathMap[tempPath]) {
                            const node = {
                                id: createId(),
                                name: part,
                                children: []
                            };
                            pathMap[tempPath] = node;
                            parentChildren.push(node);
                        }
                        parentChildren = pathMap[tempPath].children;
                    }
                }
            } else if (/^d/.test(line)) {
                const tokens = line.trim().split(/\s+/);
                const name = tokens.slice(8).join(" ");
                if (name === "." || name === "..") continue; // ignore

                const fullPath = getFullPath(currentPath, name);
                if (!pathMap[fullPath]) {
                    const node = {
                        id: createId(),
                        name: name,
                        children: []
                    };
                    pathMap[fullPath] = node;
                    if (pathMap[currentPath]) {
                        pathMap[currentPath].children.push(node);
                    } else {
                        rootChildren.push(node);
                    }
                }
            }
        }

        // === Second Pass: Add files ===
        currentPath = "/";
        for (const line of lines) {
            if (!line.trim()) continue;

            if (isPathLine(line)) {
                currentPath = line.replace(/:$/, "");
            } else if (/^[-]/.test(line)) {
                const tokens = line.trim().split(/\s+/);
                const name = tokens.slice(8).join(" ");
                if (name === "." || name === "..") continue; // ignore

                const fullPath = getFullPath(currentPath, name);
                const fileNode = { id: createId(), name: name };

                if (pathMap[currentPath]) {
                    pathMap[currentPath].children.push(fileNode);
                } else {
                    rootChildren.push(fileNode);
                }

                pathMap[fullPath] = fileNode;
            }
        }

        return rootChildren;
    }

    const handleMouseDown = (resizer) => (e) => {
        isResizingRef.current = resizer;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        const container = containerRef.current?.getBoundingClientRect();
        const main = mainRef.current?.getBoundingClientRect();

        if (!container || !main) return;

        if (isResizingRef.current === 'sidebar') {
            const newWidth = e.clientX - container.left - 64;
            setSidebarWidth(Math.max(newWidth, 100));
        }


    };

    const handleMouseUp = () => {
        isResizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={containerRef}
            style={{ height: '100vh', width: '100vw', display: 'flex' }}
        >
            {/* Sidebar */}
            <div style={{ width: (showSidebar ? sidebarWidth : 0) }} className="bg-dark-4 ">
                {sidebarValue == 'explorer' && filedata &&
                    <FileExplorer data={filedata} width={showSidebar?sidebarWidth:0} socket={send} />
                }
                {sidebarValue === 'search' && filedata &&
                    <SearchL socket={send}/>
                }
                {/* {sidebarValue === 'git' && filedata &&
                    <FileExplorer data={filedata} />
                } */}
                {sidebarValue === 'share' && filedata &&
                    <Share />
                }
                {sidebarValue === 'chat' && filedata &&
                    <Chat data={filedata} />
                }
                {sidebarValue === 'draw' && filedata && (
                    <div>Hi</div>
                    // <Whiteboard />
                )}
                {/* {sidebarValue === 'upload' && filedata && (
                    <TestEditor/>
                    // <Whiteboard />
                )} */}
            </div>
            {/* Sidebar Resizer */}
            <div
                onMouseDown={handleMouseDown('sidebar')}
                className="w-1 bg-dark-1 cursor-col-resize"
            />

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: topHeight2, background: '#9f9' }}>
                        {(sidebarValue === 'draw') && (<Whiteboard />)}
                    <div ref={mainRef} className="flex h-full w-full">
                        <VSCodeLikeEditor socket={send} />
                    </div>
                </div>

                {/* Terminal */}
                <div className='flex flex-col overflow-scroll no-scrollbar '>
                    <div className='bg-dark-1 w-full h-1'>Hi</div>
                    <div ref={terminalRef} className='w-full h-56 no-scrollbar bg-[#1e1e1e] pl-2 ' />
                </div>
                {/* {terminalData.map((id) => ( */}
                {/* <TerminalPane containerId={id} /> */}
                {/* // ))} */}
            </div>
        </div>
    );
};





const VSCodeLikeEditor = ({ socket }) => {
    const [editors, setEditors] = useState([0]);

    const addEditor = () => {
        setEditors(prev => [...prev, editors.length + 1]);

    };

    const removeEditor = (id) => {
        setEditors((prev) => prev.filter(editorId => editorId !== id));
    };

    return (
        <div className="flex flex-col w-full h-full bg-dark-4">
            {editors.length > 0 && (
                <Split
                    key={editors.join('-')}
                    className="flex-1 flex"
                    // defaultSizes={Array(editors.length).fill(100 / editors.length)}
                    minSize={100}
                    gutterSize={4}
                    direction="horizontal"
                >
                    {/* {editors.map((id) => (
                        <div
                            key={id}
                            className="p-2 bg-gray-100 overflow-auto text-black no-scrollbar"
                        >
                            <h3 className="font-semibold mb-2">Editor {id}</h3>
                            <textarea
                                className="w-full h-full min-h-[300px] resize-none border border-gray-300 p-2 rounded"
                                placeholder={`Code editor ${id}...`}
                            />
                        </div>
                    ))} */}
                    <EditorContainer socket={socket} />
                </Split>
            )}


        </div>
    );
};






const Editor = () => {
    const { id } = useParams();
    const [sidebarValue, setSidebarValue] = useState("explorer")
    const [showSidebar, setShowSidebar] = useState(true);
    const sidebarIcons = [
        { icon: <Files />, name: "explorer" },
        { icon: <Search />, name: "search" },
        { icon: <GitPullRequest />, name: "git" },
        { icon: <Share2 />, name: "share" },
        // { icon: <Phone />, name: "call" },
        { icon: <MessageCircle />, name: "chat" },
        { icon: <Pen />, name: "draw" },
        {icon: <ArrowUpFromLine />, name: "upload"},
        {icon: <ArrowDownToLine />, name: "download"},
    ];
    return (
        <div className='w-screen h-screen flex overflow-hidden'>
            <div className='bg-[#333] h-full w-16 flex flex-col justify-between items-center p-2'>
                <div className='flex flex-col gap-4'>
                    {sidebarIcons.map((item, i) => (
                        <div key={i} className={`p-2 hover:bg-dark-1 rounded cursor-pointer ${sidebarValue === item.name ? 'bg-dark-1' : ''}`} onClick={() => setSidebarValue((prev)=>{
                            if(item.name === 'draw'){
                                setShowSidebar(false)
                                return item.name;   
                            }
                            if(prev == item.name){
                                setShowSidebar(!showSidebar)
                            }
                            return prev !== item.name ? item.name : prev
                        })}>
                            {item.icon}
                        </div>
                    ))}
                    
                </div>

                <div className='flex flex-col gap-6'>
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <Settings />
                </div>
            </div>

            <ResizableLayout sidebarValue={sidebarValue} showSidebar={showSidebar}/>
        </div>
    )
}

export default Editor
