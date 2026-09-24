/**
 * Footer.jsx — Footer component with developer attribution & Discord social link.
 * Positioned next to the developer attribution for clean presentation.
 */
import { useLanguageStore } from '../store/languageStore';
import { DiscordIcon } from './DiscordIcon';

export default function Footer({ className = '' }) {
  const { t } = useLanguageStore();
  const strings = t();
  const attributionText =
    strings?.home?.footer || 'Created by Soula · The Ultimate Party Deduction Game';

  return (
    <footer
      className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-center text-xs text-white/40 select-none z-10 ${className}`}
    >
      <span className="tracking-wide">{attributionText}</span>
      <span className="text-white/20 select-none">·</span>
      <a
        href="https://discord.gg/XgVSFcvNM5"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Discord Server"
        title="Join our Discord Server"
        className="relative group inline-flex items-center gap-1.5 text-white/40 hover:text-[#5865F2] hover:drop-shadow-[0_0_8px_rgba(88,101,242,0.6)] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5865F2] rounded p-0.5"
      >
        <DiscordIcon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        
        {/* Floating tooltip */}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 border border-white/10 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 z-50">
          Join our Discord Server
        </span>
      </a>
    </footer>
  );
}

export { Footer };
