import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { configureMonaco } from "../../../utils/monacoConfig";

const getLanguageFromFile = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', json: 'json',
    ts: 'typescript', tsx: 'typescript', py: 'python',
    java: 'java', cpp: 'cpp', c: 'c', html: 'html', css: 'css',
    md: 'markdown', sh: 'shell', go: 'go', php: 'php', rs: 'rust',
    yaml: 'yaml', yml: 'yaml', xml: 'xml', txt: 'plaintext',
  };
  return map[extension] || 'plaintext';
};

export default function EditorContainer({ socket, activePath, setActivePath }) {
  const [tabs, setTabs] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const remoteDecsRef = useRef({});
  const { id: roomId } = useParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const userCursors = useRef({});
  const saveTimeoutRef = useRef(null);

  // Join and leave room
  useEffect(() => {
    if (!socket) return;
    (async () => {
      try {
        const token = await getToken();
        socket.emit('join-room', { token, roomId });
      } catch (err) {
        console.error('Auth error', err);
      }
    })();
    return () => {
      socket.emit('leave-room', { roomId });
    };
  }, [socket, getToken, roomId]);

  // Handle user joined notifications
  useEffect(() => {
    if (!socket) return;
    const handleUserJoined = ({ username }) => {
      console.log(`${username} joined`);
    };
    socket.on('user-joined', handleUserJoined);
    return () => socket.off('user-joined', handleUserJoined);
  }, [socket]);

  // Receive file content
  useEffect(() => {
    if (!socket) return;
    const onFile = ({ path, content }) => {
      setTabs(prev => {
        const found = prev.find(t => t.path === path);
        if (found) {
          return prev.map(t => t.path === path ? { ...t, content } : t);
        }
        return [...prev, { path, content }];
      });
      setActivePath(path);
    };
    socket.on('fileContent', onFile);
    return () => socket.off('fileContent', onFile);
  }, [socket]);

  // Sync code & cursors
  useEffect(() => {
    if (!socket) return;
    const onCode = ({ path, code, userId }) => {
      if (userId === (user?.firstName + ' ' + user?.lastName)) return;
      if (path !== activePath) return;
      const editor = editorRef.current;
      if (!editor) return;
      const model = editor.getModel();
      const currentCode = editor.getValue();
      if (code !== currentCode) {
        editor.executeEdits('remote-update', [{
          range: model.getFullModelRange(),
          text: code,
          forceMoveMarkers: true,
        }]);
      }
      // Add or update remote cursor decoration
      const lastLine = model.getLineCount();
      const lastColumn = model.getLineMaxColumn(lastLine);
      const newDecoration = {
        range: new monacoRef.current.Range(lastLine, lastColumn, lastLine, lastColumn),
        options: {
          className: 'remote-cursor',
          afterContentClassName: 'remote-cursor-label',
          stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
      if (userCursors.current[userId]) {
        userCursors.current[userId] = editor.deltaDecorations(userCursors.current[userId], [newDecoration]);
      } else {
        userCursors.current[userId] = editor.deltaDecorations([], [newDecoration]);
      }
    };

    const onCursor = ({ path, username, position }) => {
      if (path !== activePath) return;
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!editor || !model) return;
      const dec = [{
        range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: { className: 'remote-cursor', hoverMessage: { value: `**${username}**` } }
      }];
      const old = remoteDecsRef.current[username] || [];
      remoteDecsRef.current[username] = editor.deltaDecorations(old, dec);
    };

    socket.on('code-change', onCode);
    socket.on('cursor-change', onCursor);
    return () => {
      socket.off('code-change', onCode);
      socket.off('cursor-change', onCursor);
    };
  }, [socket, activePath, user]);

  // Create/switch Monaco models per tab
  useEffect(() => {
    if (!activePath || !monacoRef.current || !editorRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    // Build a consistent file URI
    const uri = monaco.Uri.file(activePath);

    // Try to reuse existing model
    let model = monaco.editor.getModel(uri);

    const currentTab = tabs.find(t => t.path === activePath);
    if (!currentTab) return;

    if (model) {
      if (model.getValue() !== currentTab.content) {
        model.setValue(currentTab.content);
      }
    } else {
      model = monaco.editor.createModel(
        currentTab.content,
        getLanguageFromFile(activePath),
        uri
      );
    }


    editor.setModel(model);
  }, [activePath, tabs]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Use our extendable configuration utility
    configureMonaco(monaco);

    editor.onDidChangeModelContent(async e => {
      if (e.isFlush) return;

      const code = editor.getValue();
      if (!activePath) return;
      const token = await getToken();
      
      // Sync in real-time
      socket.emit('code-change', { roomId, path: activePath, code, token });

      // Debounced Auto-save
      setSaveStatus('unsaved');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saving');
        socket.emit('save-file', { roomId, path: activePath, code });
        // Assume saved after a short delay or we could listen for a save-success event
        setTimeout(() => setSaveStatus('saved'), 1000);
      }, 2000);
    });

    editor.onDidChangeCursorPosition(async e => {
      if (!activePath) return;
      const token = await getToken();
      const model = editor.getModel();
      if (!model) return;
      const position = model.getPositionAt(e.position);
      
      socket.emit('cursor-change', { roomId, path: activePath, position: e.position, token });
    });
  };

  const handleCloseTab = (path) => {
    setTabs(prev => {
      const nt = prev.filter(t => t.path !== path);
      if (activePath === path) setActivePath(nt[0]?.path || null);
      return nt;
    });
  };

  const saveFile = async () => {
    if (!activePath) return;
    const model = editorRef.current.getModel();
    const code = model.getValue();
    console.log(activePath)
    socket.emit('save-file', { roomId, path: activePath, code });
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex border-b-2 border-b-dark-2 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.path}
            onClick={() => setActivePath(tab.path)}
            className={`flex items-center px-3 py-1.5 cursor-pointer border-r border-gray-800 transition-colors group ${tab.path === activePath ? 'bg-dark-1 text-white shadow-[inset_0_-2px_0_0_#3b82f6]' : 'text-gray-400 hover:bg-dark-2'}`}
          >
            <span className="truncate max-w-[120px] text-xs font-medium">
              {tab.path?.split('/').pop()}
            </span>
            
            <div className="ml-2 flex items-center justify-center w-5 h-5 rounded-md hover:bg-white/10 transition-colors"
                 onClick={e => { e.stopPropagation(); handleCloseTab(tab.path); }}>
              {tab.path === activePath ? (
                // For active tab, show state-dependent icon
                saveStatus === 'saved' ? (
                  <X size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full bg-blue-500 transition-all group-hover:scale-0 group-hover:opacity-0 ${saveStatus === 'saving' ? 'animate-pulse' : ''}`} />
                    <X size={14} className="absolute inset-0 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )
              ) : (
                // For inactive tabs, just show X on hover
                <X size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {activePath ? (
          <Editor
            height="100%"
            defaultLanguage={getLanguageFromFile(activePath)}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{ automaticLayout: true, minimap: { enabled: true } }}
          />
        ) : (
          <div className="p-4 text-gray-500 italic">No file open</div>
        )}
      </div>
    </div>
  );
}
