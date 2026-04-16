import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// Fetches the list of users shared on a given VM
async function fetchSharedUsers(vmId) {
  const response = await axios.get(`http://localhost:4000/${vmId}/shared-users`);
  return response.data.users;
}

export default function SharedUsersList() {
  const { getToken } = useAuth();
  const { id: vmId } = useParams();

  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  // Load shared users on mount or when vmId changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSharedUsers(vmId)
      .then(users => {
        setSharedUsers(users);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load shared users');
        setLoading(false);
      });
  }, [vmId]);

  // Handles sharing the VM with a new user
  const handleShare = async () => {
    const token = await getToken();
    if (!email) return;

    try {
      await axios.post(
        'http://localhost:4000/protected/share-repo',
        {
          id: vmId,
          obj:{
            email,
            shareConfig: ['Restricted', 'Viewer'],
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // Refresh the shared users list
      const users = await fetchSharedUsers(vmId);
      setSharedUsers(users);
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Failed to share VM');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)  return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3 className="text-center">Shared Users for VM {vmId}</h3>

      {sharedUsers.length === 0 ? (
        <p>No one has access yet.</p>
      ) : (
        <ul>
          {sharedUsers.map(user => (
            <li key={user.email} className="flex gap-2 items-center m-4">
              <img
                src={user.img}
                alt={user.name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <strong>{user.name}</strong> — <em>{user.role}</em>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="m-4 flex items-center">
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 p-2 border border-dark-1 focus:border-blue-1 rounded text-sm outline-none"
        />
        <button
          onClick={handleShare}
          className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm cursor-pointer rounded"
        >
          Share
        </button>
      </div>
    </div>
  );
}
