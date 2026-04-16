import React, { useRef, useState } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';

async function grepInContainer(containerId, searchTerm) {
    try {
      const response = await axios.get(`http://localhost:4000/search?term=${searchTerm}&container=${containerId}`, {
      });
      
      console.log('Grep output:', response.data.matches);
      return response.data.matches;
    } catch (err) {
      console.error('Error while grepping in container:', err.response?.data || err.message);
      throw err;
    }
  }
  

const SearchL = ({socket}) => {
    const searchRef = useRef(null)
    const id = useParams().id
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState({})

    const handleSearch = (e) => {
        const value = e.target.value
        setParams((prev) => ({...prev, search: value}))
        if (value.length < 3) {
            setSearchResults([])
            return
        }
        setLoading(true)
        console.log(value)
        grepInContainer(id, value).then((matches) => {
            setSearchResults(matches)
            // console.log(matches)
        }).catch((err) => {
            console.error(err)
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <div className='flex flex-col w-full h-full overflow-y-scroll no-scrollbar'>
            <form onSubmit={(e) => {
                e.preventDefault();
                setLoading(true)
                console.log(searchRef.current.value)
                grepInContainer(id, searchRef.current.value).then((matches) => {
                    setSearchResults(matches)
                    // console.log(matches)
                }).catch((err) => {
                    console.error(err)
                }).finally(() => {
                    setLoading(false);
                });

            }}>
                <div className="w-full px-1">
                    <input type="text" placeholder="Search..." className="border rounded border-dark-1  p-2 w-full my-2 ring-0 outline-0 focus:border-blue-1 text-sm" ref={searchRef} onChange={handleSearch}/>
                </div>
            </form>
            {loading && <>Loading...</>}
            {searchResults.length === 0 && !loading && (
                <div className="text-white text-sm">No results found</div>
            )}
            {searchResults.length > 0 && (
                searchResults.map((result, index) => (
                    <div key={index} className="border rounded m-1 p-1 border-dark-2 my-2 bg-dark-2 text-sm cursor-pointer select-none" onClick={()=>{ console.log(result.file);
                    socket.emit('openFile', {path: result.file, id: id})}}>
                        <p className="text-white text-sm">{result.file}</p>
                        <p className="text-green-500 text-xs">{result.match}</p>
                    </div>
                ))
            )}
        </div>
        // <div>SearchL</div>
    )
}

export default SearchL