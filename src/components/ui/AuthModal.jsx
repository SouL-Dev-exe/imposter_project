import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signIn'); // 'signIn' | 'signUp' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, guestLogin } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signIn') {
        const res = await signIn(email, password);
        if (!res.success) setError(res.error);
        else onClose();
      } else if (mode === 'signUp') {
        if (!username.trim()) {
          setError('Username is required.');
          return;
        }
        const res = await signUp(email, password, username.trim());
        if (!res.success) setError(res.error);
        else onClose();
      } else if (mode === 'guest') {
        if (!username.trim()) {
          setError('Guest nickname is required.');
          return;
        }
        guestLogin(username.trim());
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      mode === 'signIn' ? 'Welcome Back' : 
      mode === 'signUp' ? 'Create Account' : 
      'Play as Guest'
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {(mode === 'signUp' || mode === 'guest') && (
          <div>
            <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Username / Nickname</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder={mode === 'guest' ? 'Guest_123' : 'CoolPlayer99'}
              required
            />
          </div>
        )}

        {(mode === 'signIn' || mode === 'signUp') && (
          <>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="••••••••"
                required
              />
            </div>
          </>
        )}

        <div className="pt-4">
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Processing...' : (
              mode === 'signIn' ? 'Sign In' :
              mode === 'signUp' ? 'Create Account' :
              'Join as Guest'
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2 mt-4 text-center">
          {mode === 'signIn' && (
            <>
              <button type="button" onClick={() => { setMode('signUp'); setError(''); }} className="text-sm text-violet-400 hover:text-violet-300">Don't have an account? Sign Up</button>
              <button type="button" onClick={() => { setMode('guest'); setError(''); }} className="text-sm text-white/50 hover:text-white/80">Play as Guest instead</button>
            </>
          )}
          {mode === 'signUp' && (
            <>
              <button type="button" onClick={() => { setMode('signIn'); setError(''); }} className="text-sm text-violet-400 hover:text-violet-300">Already have an account? Sign In</button>
              <button type="button" onClick={() => { setMode('guest'); setError(''); }} className="text-sm text-white/50 hover:text-white/80">Play as Guest instead</button>
            </>
          )}
          {mode === 'guest' && (
            <button type="button" onClick={() => { setMode('signIn'); setError(''); }} className="text-sm text-violet-400 hover:text-violet-300">Back to Sign In</button>
          )}
        </div>
      </form>
    </Modal>
  );
}
