/**
 * Footer.jsx — Footer component with developer attribution & Discord social link.
 * Clean AAA game styling: no emoji, no glow, Lucide icons.
 */
import { useLanguageStore } from '../store/languageStore';
import { DiscordIcon } from './DiscordIcon';

export default function Footer({ className = '' }) {
  const { t } = useLanguageStore();
  const strings = t();
  const attributionText =
    strings?.home?.footer || 'Created by Soula · Tactical Deception Protocol';

  return (
    <footer
      className={`w-full py-3 px-4 flex items-center justify-center gap-2 text-center text-xs text-zinc-500 font-mono select-none z-10 ${className}`}
    >
      <span>{attributionText}</span>
      <span className="text-zinc-700 select-none">·</span>
      <a
        href="https://discord.gg/XgVSFcvNM5"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Discord Server"
        title="Join our Discord Server"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-[#5865F2] transition-colors focus:outline-none rounded p-0.5"
      >
        <DiscordIcon className="w-3.5 h-3.5" />
      </a>
    </footer>
  );
}

export { Footer };
