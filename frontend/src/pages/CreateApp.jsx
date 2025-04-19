import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import axios from "axios";

const CLIENT_ID = "YOUR_GITHUB_CLIENT_ID";
const REDIRECT_URI = "http://localhost:3000";

export default function GitHubRepoViewer() {
  const [token, setToken] = useState(null);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && !token) {
      axios
        .post("http://localhost:4000/authenticate", { code })
        .then((res) => {
          setToken(res.data.access_token);
        });
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("https://api.github.com/user/repos", {
          headers: { Authorization: `token ${token}` },
        })
        .then((res) => setRepos(res.data));
    }
  }, [token]);

  const handleLogin = () => {
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
    );
  };

  const downloadRepo = async (repo) => {
    const url = `https://api.github.com/repos/${repo.full_name}/zipball`;
    const response = await axios.get(url, {
      headers: { Authorization: `token ${token}` },
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/zip" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${repo.name}.zip`;
    link.click();
  };

  return (
    <div className="p-6 space-y-4">
      {!token ? (
        <Button onClick={handleLogin}>Login with GitHub</Button>
      ) : (
        <div className="space-y-4">
          {repos.map((repo) => (
            <Card key={repo.id} className="p-4">
              <CardContent>
                <h2 className="text-xl font-bold">{repo.name}</h2>
                <p>{repo.description}</p>
                <Button onClick={() => downloadRepo(repo)} className="mt-2">
                  Download ZIP
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
