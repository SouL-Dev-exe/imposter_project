import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';

export function ProfileCustomizer() {
  const { profile, updateProfile, signOut } = useAuthStore();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async () => {
    if (!username.trim() || username === profile.username) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    const newAvatar = `https://api.dicebear.com/9.x/bottts/svg?seed=${username.trim()}`;
    const res = await updateProfile({ username: username.trim(), avatar_url: newAvatar });
    
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
      {/* Avatar Display */}
      <div className="shrink-0">
        <img 
          src={profile.avatar_url || `https://api.dicebear.com/9.x/bottts/svg?seed=${profile.username}`} 
          alt="Avatar" 
          className="w-16 h-16 rounded-full bg-white/10 border-2 border-violet-500/50"
        />
      </div>

      {/* Inputs */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-500"
            placeholder="Username"
          />
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSave} 
            disabled={loading || username === profile.username || !username.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
        
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {success && <p className="text-emerald-400 text-xs">Profile updated!</p>}
      </div>

      {/* Sign Out */}
      <div className="shrink-0 ml-2">
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
