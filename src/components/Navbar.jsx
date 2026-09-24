/**
 * Navbar.jsx — Top navigation menu component.
 * Features brand/language/profile controls and the Discord social community link.
 */
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from './ui/LanguageToggle';
import { ProfileCustomizer } from './ui/ProfileCustomizer';
import { DiscordIcon } from './DiscordIcon';
import EconomyHeaderBadge from './economy/EconomyHeaderBadge';
import SfxToggle from './ui/SfxToggle';

export default function Navbar({
  showBack = false,
  backTo = '/',
  title = '',
  subtitle = '',
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <nav
      className={`w-full flex items-center justify-between gap-3 z-50 pointer-events-auto ${className}`}
      aria-label="Main Navigation"
    >
      {/* Left controls: Back button, LanguageToggle & Discord icon near it */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer text-lg leading-none"
            aria-label="Go back"
          >
            ←
          </button>
        )}

        <LanguageToggle variant="chip" />

        {/* Discord Social Community Link right near the language changer */}
        <a
          href="https://discord.gg/XgVSFcvNM5"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord Server"
          title="Join our Discord Server"
          className="relative group inline-flex items-center justify-center bg-black/40 hover:bg-[#5865F2]/20 backdrop-blur-md border border-white/10 hover:border-[#5865F2]/40 rounded-full px-2.5 py-1.5 text-white/70 hover:text-[#5865F2] hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.6)] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]"
        >
          <DiscordIcon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />

          {/* Floating tooltip */}
          <span className="pointer-events-none absolute -bottom-8 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 border border-white/10 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 z-50">
            Join our Discord Server
          </span>
        </a>

        {title && (
          <div className="ms-1">
            <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
            {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="ms-auto flex items-center gap-2">
        <EconomyHeaderBadge />
        <SfxToggle />
        <ProfileCustomizer />
      </div>
    </nav>
  );
}

export { Navbar };
