import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { UserPlus, Users, X, Shield, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';

// Fetches the list of users shared on a given VM
async function fetchSharedUsers(vmId) {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/vm/${vmId}/users`);
  return response.data.users;
}

export default function SharedUsersList() {
  const { getToken } = useAuth();
  const { id: vmId } = useParams();

  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Load shared users on mount or when vmId changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchSharedUsers(vmId)
      .then(users => {
        if (isMounted) {
          setSharedUsers(users);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          setError('Failed to load shared users. Please check your connection.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [vmId]);

  // Handles sharing the VM with a new user
  const handleShare = async (e) => {
    if (e) e.preventDefault();
    if (!email || isSharing) return;

    setIsSharing(true);
    const token = await getToken();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/protected/share-repo`,
        {
          id: vmId,
          obj: {
            email,
            role: 'Viewer',
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
      setIsSharing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to share VM. Ensure the user email is correct.');
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-sm">Loading collaborators...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-3 text-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-1 flex items-center gap-2 bg-dark-4/50">
        <Users size={18} className="text-blue-400" />
        <h3 className="font-semibold text-sm">Collaboration</h3>
        <span className="ml-auto text-[10px] bg-dark-1 px-2 py-0.5 rounded-full text-gray-400">
          {sharedUsers.length} {sharedUsers.length === 1 ? 'User' : 'Users'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 font-semibold underline hover:text-red-300"
              >
                Retry
              </button>
            </div>
            <button onClick={() => setError(null)} className="hover:text-red-300">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Share Form */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">
            Invite via Email
          </label>
          <form onSubmit={handleShare} className="flex gap-2">
            <div className="relative flex-1 group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={14} />
              <input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-dark-4 border border-dark-1 focus:border-blue-500/50 rounded-lg py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <button
              type="submit"
              disabled={isSharing || !email}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[40px]"
              title="Invite"
            >
              {isSharing ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">
            People with Access
          </label>
          
          {sharedUsers.length === 0 ? (
            <div className="text-center py-8 bg-dark-4/30 rounded-xl border border-dashed border-dark-1">
              <p className="text-xs text-gray-500 italic px-4">
                No one has been invited to this VM yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedUsers.map(user => (
                <div 
                  key={user.email} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-4/50 border border-dark-1 hover:border-gray-700 transition-all group"
                >
                  <div className="relative">
                    <img
                      src={user.img}
                      alt={user.name}
                      className="h-9 w-9 rounded-full border border-dark-1 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 h-2.5 w-2.5 rounded-full border-2 border-dark-4"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white truncate">{user.name}</span>
                      {user.role === 'Owner' && <ShieldCheck size={12} className="text-blue-400" title="Owner" />}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      user.role === 'Owner' ? 'bg-blue-500/10 text-blue-400' :
                      user.role === 'Editor' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-dark-4/80 backdrop-blur-sm border-t border-dark-1 text-[10px] text-gray-500">
        <div className="flex items-center gap-2">
          <Shield size={12} />
          <span>Only invited users can access this environment.</span>
        </div>
      </div>
    </div>
  );
}
