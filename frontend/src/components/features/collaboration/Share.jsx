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

export default function SharedUsersList({ currentRole }) {
  const { getToken } = useAuth();
  const { id: vmId } = useParams();

  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
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
            role: inviteRole,
            shareConfig: ['Restricted', inviteRole],
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

  // Handles changing the role of an existing collaborator
  const handleChangePermission = async (targetEmail, newRole) => {
    const token = await getToken();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/protected/share-repo`,
        {
          id: vmId,
          obj: {
            email: targetEmail,
            role: newRole,
            shareConfig: ['Restricted', newRole],
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
    } catch (err) {
      console.error(err);
      setError('Failed to update permission.');
    }
  };

  // Handles removing an existing collaborator
  const handleRemoveUser = async (targetEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${targetEmail}?`)) return;
    const token = await getToken();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/protected/remove-user`,
        {
          id: vmId,
          email: targetEmail
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
    } catch (err) {
      console.error(err);
      setError('Failed to remove collaborator.');
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
    <div className="flex flex-col h-full bg-dark-3 text-gray-200 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-dark-4/40 backdrop-blur-md">
        <Users size={18} className="text-blue-500 animate-pulse" />
        <h3 className="font-semibold text-sm tracking-wide">Collaborators</h3>
        <span className="ml-auto text-[10px] bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full text-blue-400 font-semibold">
          {sharedUsers.length} {sharedUsers.length === 1 ? 'active' : 'active'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 font-semibold underline hover:text-red-300 transition-colors"
              >
                Retry
              </button>
            </div>
            <button onClick={() => setError(null)} className="hover:text-red-300 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Share Form Container */}
        <div className="bg-dark-4/30 p-4 rounded-xl border border-white/5 space-y-3 shadow-inner">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-0.5">
            Invite via Email
          </label>
          <form onSubmit={handleShare} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-dark-4 border border-white/5 focus:border-blue-500/50 rounded-lg py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-gray-600 text-white"
                />
              </div>
              {currentRole === 'Owner' && (
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="bg-dark-4 border border-white/5 focus:border-blue-500/50 rounded-lg py-2 px-3 text-sm outline-none text-gray-300 cursor-pointer transition-all"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </select>
              )}
            </div>
            <button
              type="submit"
              disabled={isSharing || !email}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-medium text-xs py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transform"
              title="Invite User"
            >
              {isSharing ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
              Invite Member
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-0.5">
            People with Access
          </label>
          
          {sharedUsers.length === 0 ? (
            <div className="text-center py-8 bg-dark-4/10 rounded-xl border border-dashed border-white/5">
              <p className="text-xs text-gray-500 italic px-4">
                No one has been invited to this VM yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sharedUsers.map(user => (
                <div 
                  key={user.email} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark-4/20 border border-white/5 hover:bg-dark-4/40 hover:border-white/10 transition-all duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={user.img || "/icons/default-avatar.png"}
                      alt={user.name}
                      className="h-9 w-9 rounded-full border border-white/10 object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 h-2.5 w-2.5 rounded-full border-2 border-dark-3 shadow-md"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                      {user.role === 'Owner' && <ShieldCheck size={12} className="text-blue-500" title="Owner" />}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentRole === 'Owner' && user.role !== 'Owner' ? (
                      <>
                        <select
                          value={user.role}
                          onChange={(e) => handleChangePermission(user.email, e.target.value)}
                          className="bg-dark-4 border border-white/5 rounded-lg text-[10px] font-semibold px-2 py-1 outline-none text-gray-300 focus:border-blue-500/50 cursor-pointer transition-all hover:bg-dark-2"
                        >
                          <option value="Viewer">Viewer</option>
                          <option value="Editor">Editor</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(user.email)}
                          className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Remove user"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        user.role === 'Owner' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                        user.role === 'Editor' ? 'bg-purple-500/5 text-purple-400 border-purple-500/20' :
                        'bg-gray-500/5 text-gray-400 border-gray-500/20'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-dark-4/60 backdrop-blur-md border-t border-white/5 text-[9px] text-gray-500 mt-auto">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-blue-500/60" />
          <span>Only invited users can access this environment.</span>
        </div>
      </div>
    </div>
  );
}

