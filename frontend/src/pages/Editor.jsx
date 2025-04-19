import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Files, GitPullRequest, MessageCircle, Pen, Phone, Search, Settings, Share2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import Split from 'react-split';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';


const ResizableLayout = () => {
    const { getToken } = useAuth();
    const containerRef = useRef(null);
    const isResizingRef = useRef(null);
    const mainRef = useRef(null);
    const terminalRef = useRef(null);

    const socketRef = useRef(null);
    const xterm = useRef(null);
    const fitAddon = useRef(null);

    const [data, setData] = useState([]);
    const [change, setChange] = useState();
    const [sidebarWidth, setSidebarWidth] = useState(200);
    const [topHeight2, setTopHeight2] = useState(600);

    useEffect(() => {
        xterm.current = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff'
            }
        });

        fitAddon.current = new FitAddon();
        xterm.current.loadAddon(fitAddon.current);

        if (terminalRef.current) {
            xterm.current.open(terminalRef.current);
            setTimeout(() => fitAddon.current.fit(), 0); // Ensure fit after mount
        }

        const observer = new ResizeObserver(() => {
            fitAddon.current?.fit();
        });

        if (terminalRef.current) {
            observer.observe(terminalRef.current);
        }

        const token = getToken();
        socketRef.current = io('http://localhost:4000',
            // {
            //     authorization: { token },
            // }
            {
                extraHeaders: {
                  authorization: `bearer ${token}`
                }}
        );

        xterm.current.onData(data => {
            socketRef.current.emit('input', data);
        });

        socketRef.current.on('output', data => {
            xterm.current.write(data);
        });

        const handleBeforeUnload = () => {
            socketRef.current.emit('output', 'Page is being refreshed or changed');
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        socketRef.current.on('files', data => {
            const fileOutput = document.getElementById("fileOutput");
            if (data.error) {
                fileOutput.textContent = `Error: ${data.error}`;
            } else {
                fileOutput.textContent = `Files:\n${data.files.join('\n')}`;
                setData(data.files);
            }
        });

        return () => {
            xterm.current?.dispose();
            socketRef.current?.disconnect();
            observer.disconnect();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const path = '/';
        console.log('Getting files from path:', path);
        socketRef.current.emit('getFiles', { path });
    }, [change]);

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
            <div style={{ width: sidebarWidth }} className="bg-dark-1">
                Sidebar
            </div>

            {/* Sidebar Resizer */}
            <div
                onMouseDown={handleMouseDown('sidebar')}
                className="w-1 bg-dark-1 cursor-col-resize"
            />

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: topHeight2, background: '#9f9' }}>
                    <div ref={mainRef} className="flex h-full w-full">
                        <VSCodeLikeEditor />
                    </div>
                </div>

                {/* Terminal */}
                <div className='flex flex-col'>
                    <div className='bg-dark-1 w-full h-3'></div>
                    <div ref={terminalRef} className='w-full h-56 no-scrollbar bg-[#1e1e1e] pl-2' />
                </div>
            </div>
        </div>
    );
};


const VSCodeLikeEditor = () => {
    const [editors, setEditors] = useState([0]);

    const addEditor = () => {
        setEditors(prev => [...prev, editors.length + 1]);

    };

    const removeEditor = (id) => {
        setEditors((prev) => prev.filter(editorId => editorId !== id));
    };

    return (
        <div className="flex flex-col w-full h-full bg-dark-4">
            <div className="p-2 bg-gray-800 text-white flex justify-between items-center">
                <h2 className="text-lg">VSCode Clone</h2>
                <button
                    onClick={addEditor}
                    className="px-4 py-1 bg-blue-500 rounded hover:bg-blue-600"
                >
                    + New Editor
                </button>
            </div>
            {editors.length > 0 && (
                <Split
                    key={editors.join('-')}
                    className="flex-1 flex"
                    defaultSizes={Array(editors.length).fill(100 / editors.length)}
                    minSize={100}
                    gutterSize={4}
                    direction="horizontal"
                >
                    {editors.map((id) => (
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
                    ))}
                </Split>
            )}


        </div>
    );
};






const Editor = () => {
    const { id } = useParams();
    const [selected, setSelected] = React.useState("Files");
    const sidebarIcons = [
        { icon: <Files />, name: "Files" },
        { icon: <Search />, name: "Search" },
        { icon: <GitPullRequest />, name: "Git Pull Request" },
        { icon: <Share2 />, name: "Share" },
        { icon: <Phone />, name: "Phone" },
        { icon: <MessageCircle />, name: "Message" },
        { icon: <Pen />, name: "Pen" },
    ];
    return (
        <div className='w-screen h-screen flex overflow-hidden'>
            <div className='bg-[#333] h-full w-16 flex flex-col justify-between items-center p-2'>
                <div className='flex flex-col gap-6'>
                    {sidebarIcons.map((item, i) => (
                        <div key={i} className={`p-2 hover:bg-dark-1 rounded cursor-pointer ${selected === item.name ? 'bg-dark-1' : ''}`} onClick={() => setSelected(item.name)}>
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

            <ResizableLayout />
        </div>
    )
}

export default Editor

// import React, { useEffect, useRef } from 'react';
// import { Terminal } from 'xterm';
// import { FitAddon } from 'xterm-addon-fit';
// import { io } from 'socket.io-client';

// export default function Editor() {
//   const xterm = useRef();
//   const fitAddon = useRef();
//   const terminalRef = useRef();
//   const socketRef = useRef();

//   useEffect(() => {
//     xterm.current = new Terminal({ cursorBlink: true, fontSize: 14 });
//     fitAddon.current = new FitAddon();
//     xterm.current.loadAddon(fitAddon.current);
//     xterm.current.open(terminalRef.current);
//     fitAddon.current.fit();

//     socketRef.current = io('http://localhost:4000', {
//       withCredentials: true,
//     });

//     socketRef.current.on('connect', () => {
//       console.log('✅ Connected to back‑end socket:', socketRef.current.id);
//     });

//     xterm.current.onData(data => socketRef.current.emit('input', data));
//     socketRef.current.on('output', data => xterm.current.write(data));

//     return () => {
//       socketRef.current.disconnect();
//       xterm.current.dispose();
//     };
//   }, []);

//   return <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />;
// }
