/**
 * DiscordIcon.jsx — SVG Discord icon & linked social button.
 * Discord Blurple: #5865F2
 * Points to https://discord.gg/XgVSFcvNM5
 */

export function DiscordIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function DiscordLink({
  className = '',
  iconClassName = 'w-5 h-5',
  variant = 'icon', // 'icon' | 'button'
  showLabel = false,
  label = 'Discord',
}) {
  const baseClasses =
    'relative group inline-flex items-center justify-center transition-all duration-200 text-white/50 hover:text-[#5865F2] hover:drop-shadow-[0_0_10px_rgba(88,101,242,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2]';

  const variantClasses = {
    icon: 'p-2 rounded-xl bg-white/5 hover:bg-[#5865F2]/15 border border-white/10 hover:border-[#5865F2]/40',
    button:
      'px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#5865F2]/15 border border-white/10 hover:border-[#5865F2]/40 text-xs font-semibold gap-2 shadow-sm',
    inline: 'p-1 rounded-md hover:bg-[#5865F2]/10',
  };

  return (
    <a
      href="https://discord.gg/XgVSFcvNM5"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our Discord Server"
      title="Join our Discord Server"
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
    >
      <DiscordIcon
        className={`${iconClassName} transition-transform duration-200 group-hover:scale-110`}
      />
      {showLabel && <span className="leading-none text-xs font-medium">{label}</span>}

      {/* Floating tooltip */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 border border-white/10 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 z-50">
        Join our Discord Server
      </span>
    </a>
  );
}

export default DiscordLink;
