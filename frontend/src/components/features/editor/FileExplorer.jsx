import React, { useEffect, useState, useRef } from "react";
import { Tree } from "react-arborist";
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import { useParams } from "react-router-dom";
import { Pen, Trash, FilePlus, FolderPlus } from "lucide-react";

// FileNode displays each entry and notifies when a file is clicked
const FileNode = ({ node, style, dragHandle, onOpenFile, onDelete, onRename, onSelect }) => {
  const isFolder = Array.isArray(node.data.children);

  const handleClick = (e) => {
    onSelect(node.data.id);
    if (isFolder) {
      node.toggle();
    } else {
      onOpenFile(node.data.id);
    }
  };

  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        cursor: "pointer",
        backgroundColor: node.isSelected ? "#33445c" : "transparent",
      }}
      className="justify-between items-center w-full gap-3 group hover:bg-dark-1 pr-4"
      ref={dragHandle}
      onClick={handleClick}
    >
      <div className="flex gap-2 pl-2 flex-1 min-w-0 items-center">
        {isFolder
          ? node.isOpen
            ? <img src={`/icons/${getIconForOpenFolder()}`} height={16} width={16} alt="folder" />
            : <img src={`/icons/${getIconForFolder()}`} height={16} width={16} alt="folder" />
          : <img src={`/icons/${getIconForFile(node.data.name)}`} height={16} width={16} alt="file" />}
        <span className="text-sm truncate">{node.data.name}</span>
      </div>
      <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
        <Trash
          size={14}
          className="group-hover:opacity-100 opacity-0 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
          onClick={() => onDelete(node.data.id)}
        />
        <Pen
          size={14}
          className="group-hover:opacity-100 opacity-0 text-gray-400 hover:text-blue-400 transition-all cursor-pointer"
          onClick={() => onRename(node.data.id)}
        />
      </div>
    </div>
  );
};

// Main explorer component
export default function FileExplorer({ data: initialData, width, socket, activePath }) {
  const [data, setData] = useState(initialData);
  const treeRef = useRef(null);
  const [isCreating, setIsCreating] = useState(null); // 'file', 'folder', or null
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (activePath && treeRef.current) {
      treeRef.current.scrollTo(activePath);
    }
  }, [activePath]);

  const { id: vmId } = useParams();

  const handleOpenFile = (id) => {
    if (socket) {
      socket.emit("openFile", { id: vmId, path: id });
    }
  };

  const deleteNodeById = (nodes, id) => {
    return nodes
      .map(node => {
        if (node.id === id) return null;
        if (node.children) {
          return { ...node, children: deleteNodeById(node.children, id) };
        }
        return node;
      })
      .filter(Boolean);
  };

  const renameNodeById = (nodes, id, newName) => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return { ...node, children: renameNodeById(node.children, id, newName) };
      }
      return node;
    });
  };

  const handleDelete = (id) => {
    if (socket) {
      socket.emit("deleteFile", { id: vmId, path: id });
    }
    setData(prev => deleteNodeById(prev, id));
  };

  const handleRename = (id) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;
    if (socket) {
      socket.emit("renameFile", { id: vmId, path: id, newName });
    }
    setData(prev => renameNodeById(prev, id, newName));
  };

  const handleMove = ({ dragIds, parentId, index }) => {
    const reorderTree = (treeData, dragIds, parentId, index) => {
      const deep = JSON.parse(JSON.stringify(treeData));
      const findNodeById = (nodes, id) => {
        for (const n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findNodeById(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      const removeNodeById = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) return nodes.splice(i, 1)[0];
          if (nodes[i].children) {
            const found = removeNodeById(nodes[i].children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const dragged = dragIds.map((id) => removeNodeById(deep, id)).filter(Boolean);
      let container = parentId == null
        ? { children: deep }
        : findNodeById(deep, parentId) || { children: deep };
      if (!container.children) container.children = [];
      container.children.splice(index, 0, ...dragged);
      return deep;
    };
    setData((d) => reorderTree(d, dragIds, parentId, index));
  };

  const startCreation = (type) => {
    setIsCreating(type);
    setNewName("");
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleCreateSubmit = (e) => {
    if (e.key === "Enter") {
      finalizeCreation();
    } else if (e.key === "Escape") {
      setIsCreating(null);
    }
  };

  const finalizeCreation = () => {
    if (!newName.trim() || !isCreating) {
      setIsCreating(null);
      return;
    }

    let creationDir = "/app";
    
    // Determine target directory using the current selection (selectedId)
    const target = selectedId || activePath;

    if (target) {
      const findInTree = (nodes, id) => {
        for (const n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findInTree(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const node = findInTree(data, target);
      if (node) {
        if (node.children) {
          // It's a folder
          creationDir = target;
        } else {
          // It's a file, get parent dir
          creationDir = target.substring(0, target.lastIndexOf("/")) || "/app";
        }
      }
    }

    const fullPath = `${creationDir}/${newName.trim()}`.replace(/\/+/g, '/');
    const event = isCreating === "file" ? "createFile" : "createFolder";
    
    if (socket) {
      socket.emit(event, { id: vmId, path: fullPath });
    }
    
    setIsCreating(null);
    setNewName("");
  };

  return (
    <div style={{ display: "flex", height: "100%" }} className="flex-col bg-dark-3">
      <div className="flex bg-dark-2 py-1.5 border-b border-gray-800 text-gray-400 px-3 items-center justify-between group/header">
        <span className="text-[11px] font-bold uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
          <FilePlus 
            size={16} 
            className="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/10" 
            onClick={() => startCreation('file')}
            title="New File..."
          />
          <FolderPlus 
            size={16} 
            className="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/10" 
            onClick={() => startCreation('folder')}
            title="New Folder..."
          />
        </div>
      </div>
      
      {isCreating && (
        <div className="px-3 py-2 bg-dark-3 border-b border-gray-800">
          <div className="flex items-center gap-2 bg-dark-4 border border-blue-500 rounded px-2 py-1">
            {isCreating === 'file' ? <FilePlus size={14} className="text-blue-400" /> : <FolderPlus size={14} className="text-blue-400" />}
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-sm text-white w-full"
              placeholder={`New ${isCreating}...`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleCreateSubmit}
              onBlur={finalizeCreation}
            />
          </div>
        </div>
      )}

      <Tree
        data={data}
        ref={treeRef}
        selection={activePath}
        onMove={handleMove}
        childrenAccessor="children"
        height={725}
        rowHeight={30}
        width={width}
      >
        {(props) => (
          <FileNode
            {...props}
            onOpenFile={handleOpenFile}
            onDelete={handleDelete}
            onRename={handleRename}
            onSelect={handleSelect}
          />
        )}
      </Tree>
    </div>
  );
}
