import React, { useEffect, useState, useRef } from "react";
import { Tree } from "react-arborist";
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import { useParams } from "react-router-dom";
import { Pen, Trash } from "lucide-react";

// Depth-first search to build the path (array of segments) to the target node
function dfsRecursive(nodes, targetId, currentPath = []) {
  for (const node of nodes) {
    // assume each raw data node has a `path` or fallback to its `name`
    const segment = node.path || node.name;
    const newPath = [...currentPath, segment];
    if (node.id === targetId) {
      return newPath;
    }
    if (Array.isArray(node.children)) {
      const foundPath = dfsRecursive(node.children, targetId, newPath);
      if (foundPath) return foundPath;
    }
  }
  return null;
}

// FileNode displays each entry and notifies when a file is clicked
const FileNode = ({ node, style, dragHandle, onOpenFile, onDelete, onRename }) => {
  const isFolder = Array.isArray(node.data.children);

  const handleClick = () => {
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
        backgroundColor: node.isOpen ? "#33445c" : "transparent",
      }}
      className="justify-between items-center w-fit gap-3 group hover:bg-green-400"
      ref={dragHandle}

    >
      <div className="flex gap-2 pl-2" onClick={handleClick}>
        {isFolder
          ? node.isOpen
            ? <img src={`/icons/${getIconForOpenFolder()}`} height={16} width={16} />
            : <img src={`/icons/${getIconForFolder()}`} height={16} width={16} />
          : <img src={`/icons/${getIconForFile(node.data.name)}`} height={16} width={16} />}
        <span className="text-sm">{node.data.name}</span>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Trash
          size={16}
          className="group-hover:opacity-100 opacity-0"
          onClick={() => onDelete(node.data.id)}
        />
        <Pen
          size={16}
          className="group-hover:opacity-100 opacity-0"
          onClick={() => onRename(node.data.id)}
        />
      </div>
    </div>
  );
};


// Main explorer component
export default function FileExplorer({ data: initialData, width, socket }) {
  const [data, setData] = useState(initialData);
  const { id: vmId } = useParams(); // Get the id from the URL params
  const handleOpenFile = (id) => {
    const pathArray = dfsRecursive(data, id);
    if (!pathArray) {
      console.warn(`Node with id ${id} not found`);
      return;
    }
    // join segments into a normalized path string
    const filePath = pathArray.join("/");
    if (socket) {
      socket.emit("openFile", { id: vmId, path: filePath });
    }
    console.log(JSON.stringify({ type: "openFile", path: filePath }));
  };

  // Recursively delete a node by id
  const deleteNodeById = (nodes, id) => {
    return nodes
      .map(node => {
        if (node.id === id) return null;
        if (node.children) {
          node.children = deleteNodeById(node.children, id);
        }
        return node;
      })
      .filter(Boolean);
  };

  // Recursively rename a node by id
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
    const pathArray = dfsRecursive(data, id);
    if (!pathArray) {
      console.warn(`Node with id ${id} not found`);
      return;
    }
    // join segments into a normalized path string
    const filePath = pathArray.join("/");
    if (socket) {
      socket.emit("deleteFile", { id: vmId, path: filePath });
    }
    console.log("deleted", JSON.stringify({ type: "deleteFile", path: filePath }));
    setData(prev => deleteNodeById(prev, id));
  };

  const handleRename = (id) => {
    const newName = prompt("Enter new name:");
    if (!newName) return; // Cancelled or empty name
    const pathArray = dfsRecursive(data, id);
    if (!pathArray) {
      console.warn(`Node with id ${id} not found`);
      return;
    }
    // join segments into a normalized path string
    const filePath = pathArray.join("/");
    if (socket) {
      socket.emit("renameFile", { id: vmId, path: filePath, newName });
    }
    if (newName) {
      setData(prev => renameNodeById(prev, id, newName));
    }
  };

  // 3) Handle drag-and-drop reorder (unchanged)
  const handleMove = ({ dragIds, parentId, index }) => {
    const reorderTree = (treeData, dragIds, parentId, index) => {
      const deep = JSON.parse(JSON.stringify(treeData));
      const removeNodeById = (nodes, id) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) return nodes.splice(i, 1)[0];
          if (nodes[i].children) {
            const rem = removeNodeById(nodes[i].children, id);
            if (rem) return rem;
          }
        }
        return null;
      };
      const findNodeById = (nodes, id) => {
        for (const n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const f = findNodeById(n.children, id);
            if (f) return f;
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

  return (
    <div style={{ display: "flex", height: "100%" }} className="flex-col">
      <div className="flex bg-dark-2 py-1 border border-dark-4 rounded-xs text-gray-300 px-2">
        File Explorer
      </div>
      <Tree
        data={data}
        onMove={handleMove}
        childrenAccessor="children"
        height={725}
        rowHeight={30}
        width={width}
        openByDefault={false}
        className="no-scrollbar"
      >
        {({ node, style, dragHandle }) => (
          <FileNode
            node={node}
            style={style}
            dragHandle={dragHandle}
            onOpenFile={handleOpenFile}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        )}
      </Tree>

    </div>
  );
}
