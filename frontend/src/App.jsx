// import React from 'react'
// import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

// const App = () => {
//   return (
//     <>
//       <SignedOut>
//         <SignInButton />
//       </SignedOut>
//       <SignedIn>
//         <UserButton />
//       </SignedIn>
//     </>

//   )
// }

// export default App

// import React, { useState, useEffect } from "react";
// import { Button } from "./components/ui/button";
// import { Card, CardContent } from "./components/ui/card";
// import axios from "axios";

// const CLIENT_ID = "Ov23litnD3UKR6Vh9VyS";
// const REDIRECT_URI = "http://localhost:5173";
// const user = "i-harshit-sharma"; // GitHub username

// export default function App() {
//   const [token, setToken] = useState(null);
//   const [repos, setRepos] = useState([]);

//   // Authenticate (exchange code for access token)
//   useEffect(() => {
//     const code = new URLSearchParams(window.location.search).get("code");
//     if (code && !token) {
//       axios
//         .post("http://localhost:4000/authenticate", { code })
//         .then((res) => {
//           setToken(res.data.access_token);
//         })
//         .catch((error) =>
//           console.error("Error authenticating with GitHub:", error)
//         );
//     }
//   }, [token]);

//   // Fetch user's repositories (both public & private)
//   useEffect(() => {
//     if (token) {
//       axios
//         .get("https://api.github.com/user/repos", {
//           headers: { Authorization: `token ${token}` },
//         })
//         .then((res) => setRepos(res.data))
//         .catch((error) =>
//           console.error("Error fetching repositories:", error)
//         );
//     }
//   }, [token]);

//   // Trigger GitHub OAuth login
//   const handleLogin = () => {
//     window.location.assign(
//       `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo`
//     );
//   };

//   // Download repository ZIP using the Express server endpoint
//   const downloadRepo = async (repo) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:4000/download/${user}/${repo.name}`,
//         {
//           headers: {
//             Authorization: `token ${token}`,
//           },
//           responseType: "blob",
//         }
//       );
//       const blob = new Blob([response.data], { type: "application/zip" });
//       const link = document.createElement("a");
//       link.href = window.URL.createObjectURL(blob);
//       link.download = `${repo.name}.zip`;
//       link.click();
//     } catch (error) {
//       console.error("Error downloading repository:", error);
//     }
//   };

//   console.log(repos);

//   return (
//     <div className="p-6 space-y-4">
//       {!token ? (
//         <Button onClick={handleLogin}>Login with GitHub</Button>
//       ) : repos.length === 0 ? (
//         <div className="text-center">
//           <p className="text-lg">No repositories found.</p>
//         </div>
//       ) : (
//         repos.map((repo) => (
//           <Card key={repo.id} className="p-4">
//             <CardContent>
//               <h2 className="text-xl font-bold">{repo.name}</h2>
//               <p>{repo.description}</p>
//               <Button onClick={() => downloadRepo(repo)} className="mt-2">
//                 Download ZIP
//               </Button>
//             </CardContent>
//           </Card>
//         ))
//       )}
//     </div>
//   );
// }

import React, { useState } from 'react';

const App = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState('');

  const fetchRepoInfo = async () => {
    try {
      // Extract owner and repo from the URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        setError('Invalid GitHub URL');
        setRepoData(null);
        return;
      }

      const [_, owner, repo] = match;

      // Fetch from GitHub API
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) throw new Error('Repository not found');

      const data = await response.json();
      setRepoData(data);
      setError('');
    } catch (err) {
      setError(err.message);
      setRepoData(null);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">GitHub Repo Info</h1>

      <input
        type="text"
        placeholder="Enter GitHub repo URL"
        className="border p-2 w-full rounded mb-2"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />
      <button
        onClick={fetchRepoInfo}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get Info
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {repoData && (
        <div className="mt-4 p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">{repoData.full_name}</h2>
          <p>{repoData.description}</p>
          <p>⭐ Stars: {repoData.stargazers_count}</p>
          <p>🍴 Forks: {repoData.forks_count}</p>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View on GitHub
          </a>
        </div>
      )}
    </div>
  );
};

export default App;


// import React, { useState } from 'react';
// import axios from 'axios';

// const CodeExecutor = () => {
//   const [code, setCode] = useState('');
//   const [language, setLanguage] = useState('python');
//   const [output, setOutput] = useState('');
//   const [error, setError] = useState(null);

//   const handleExecute = async () => {
//     try {
//       setOutput('');
//       setError(null);
//       const response = await axios.post('http://localhost:4000/run-code', { language, code });
//       setOutput(response.data.output);
//       if (response.data.error) {
//         setError(response.data.error);
//       }
//     } catch (err) {
//       setError(err.response ? err.response.data.error : err.message);
//     }
//   };

//   return (
//     <div>
//       <h2>Code Executor</h2>
//       <textarea
//         rows="10"
//         cols="50"
//         value={code}
//         onChange={(e) => setCode(e.target.value)}
//         placeholder="Write your code here..."
//       ></textarea>
//       <br />
//       <button onClick={handleExecute}>Run Code</button>
//       <h3>Output:</h3>
//       <pre>{output}</pre>
//       {error && (
//         <>
//           <h3>Error:</h3>
//           <pre>{error}</pre>
//         </>
//       )}
//     </div>
//   );
// };

// export default CodeExecutor;
