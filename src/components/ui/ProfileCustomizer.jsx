/**
 * ProfileCustomizer.jsx — Header avatar trigger & Profile Modal.
 */
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useEconomyStore } from '../../store/economyStore';
import { UserAvatar } from './UserAvatar';
import ProfileModal from './ProfileModal';

export function ProfileCustomizer() {
  const { profile } = useAuthStore();
  const [open, setOpen] = useState(false);
  const equippedAvatarStyle = useEconomyStore((s) => s.equippedAvatarStyle);
  const equipped = useEconomyStore((s) => s.equipped);

  // Guest / logged-out fallback
  const username = profile?.username || 'Player';

  return (
    <>
      {/* Dynamic User Avatar Button */}
      <button
        onClick={() => setOpen(true)}
        title="Settings & Profile"
        className="group flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1 transition-all cursor-pointer"
      >
        <UserAvatar
          username={username}
          avatarStyle={equippedAvatarStyle}
          equipped={equipped}
          size="sm"
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-white text-xs font-bold max-w-[90px] truncate">{username}</span>
        <span className="text-white/40 text-xs">⚙️</span>
      </button>

      {/* Settings Modal */}
      <ProfileModal isOpen={open} onClose={() => setOpen(false)} defaultTab="settings" />
    </>
  );
}

export default ProfileCustomizer;
