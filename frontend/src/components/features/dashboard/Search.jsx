import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Search, X, Loader2, FileCode, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

async function grepInContainer(containerId, searchTerm) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search?term=${searchTerm}&container=${containerId}`, {});
      return response.data.matches;
    } catch (err) {
      console.error('Error while grepping in container:', err.response?.data || err.message);
      throw err;
    }
}

// Helper to highlight search term in a line of code
const HighlightedText = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-500/30 text-yellow-300 font-semibold px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

const SearchL = ({ socket }) => {
    const id = useParams().id
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedFiles, setExpandedFiles] = useState({})

    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            grepInContainer(id, searchTerm)
                .then((matches) => {
                    setSearchResults(matches);
                    // Automatically expand all files on new search
                    const initialExpanded = {};
                    matches.forEach(m => {
                        initialExpanded[m.file] = true;
                    });
                    setExpandedFiles(initialExpanded);
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, id]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim().length < 3) return;
        setLoading(true);
        grepInContainer(id, searchTerm)
            .then((matches) => {
                setSearchResults(matches);
                const initialExpanded = {};
                matches.forEach(m => {
                    initialExpanded[m.file] = true;
                });
                setExpandedFiles(initialExpanded);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Group search results by file
    const groupedResults = searchResults.reduce((acc, current) => {
        if (!acc[current.file]) {
            acc[current.file] = [];
        }
        acc[current.file].push(current.match);
        return acc;
    }, {});

    const toggleFileExpand = (filePath) => {
        setExpandedFiles(prev => ({
            ...prev,
            [filePath]: !prev[filePath]
        }));
    };

    return (
        <div className='flex flex-col w-full h-full overflow-hidden text-gray-300 bg-dark-3'>
            {/* Search Input Form */}
            <form onSubmit={handleFormSubmit} className="p-3 border-b border-gray-800 flex-none">
                <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search text in files..." 
                        className="bg-dark-4 border border-dark-1 rounded-lg pl-9 pr-9 py-2 w-full text-white ring-0 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 text-xs placeholder:text-gray-500 transition-all" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            type="button" 
                            onClick={() => setSearchTerm('')} 
                            className="absolute right-3 p-0.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </form>

            {/* Results Content Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
                {/* Initial View */}
                {searchTerm.trim().length < 3 && !loading && (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <Search size={32} className="text-gray-600 mb-2 animate-pulse" />
                        <p className="text-xs text-gray-400 font-medium">Search Across Codebase</p>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[180px]">Type 3 or more characters to run a fast search within your project files.</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
                        <p className="text-xs text-gray-400">Searching files...</p>
                    </div>
                )}

                {/* No Results Found */}
                {searchTerm.trim().length >= 3 && searchResults.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                        <AlertCircle size={28} className="text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No results found</p>
                        <p className="text-[10px] text-gray-500 mt-1 max-w-[200px]">No matches found for "{searchTerm}". Try a different keyword.</p>
                    </div>
                )}

                {/* Grouped Results Display */}
                {searchResults.length > 0 && !loading && (
                    <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 px-1 uppercase tracking-wider font-semibold">
                            Found {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} in {Object.keys(groupedResults).length} {Object.keys(groupedResults).length === 1 ? 'file' : 'files'}
                        </p>

                        {Object.entries(groupedResults).map(([filePath, matches]) => {
                            const fileName = filePath.split('/').pop();
                            const dirPath = filePath.replace('/app/', '').replace(fileName, '');
                            const isExpanded = expandedFiles[filePath];

                            return (
                                <div key={filePath} className="border border-gray-800 rounded-lg overflow-hidden bg-dark-4">
                                    {/* File Header */}
                                    <div 
                                        onClick={() => toggleFileExpand(filePath)}
                                        className="flex items-center gap-2 p-2 hover:bg-white/5 cursor-pointer border-b border-gray-800/50 select-none"
                                    >
                                        {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                                        <FileCode size={14} className="text-blue-400" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-semibold text-white truncate">{fileName}</span>
                                            {dirPath && <span className="text-[9px] text-gray-500 truncate">{dirPath}</span>}
                                        </div>
                                        <span className="ml-auto text-[9px] bg-dark-2 border border-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">
                                            {matches.length}
                                        </span>
                                    </div>

                                    {/* Matches within File */}
                                    {isExpanded && (
                                        <div className="divide-y divide-gray-800/40">
                                            {matches.map((matchLine, index) => (
                                                <div 
                                                    key={index} 
                                                    className="p-2 hover:bg-blue-500/5 cursor-pointer transition-colors text-[11px] font-mono text-gray-400 select-none overflow-x-auto no-scrollbar whitespace-nowrap"
                                                    onClick={() => socket.emit('openFile', { path: filePath, id: id })}
                                                >
                                                    <HighlightedText text={matchLine} highlight={searchTerm} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchL