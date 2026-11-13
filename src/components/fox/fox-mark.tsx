/** Cyber fox emblem — neon circuit style */
export function FoxMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`fox-mark ${className}`.trim()}
      viewBox="0 0 64 64"
      width="48"
      height="48"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cyber-fox" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="45%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="cyber-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
        </linearGradient>
        <filter id="cyber-glow-f">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* head */}
      <ellipse cx="32" cy="34" rx="18" ry="16" fill="url(#cyber-fox)" />
      {/* ears */}
      <path d="M18 22 L12 6 L24 18 Z" fill="url(#cyber-fox)" stroke="#22d3ee" strokeWidth="0.8" />
      <path d="M46 22 L52 6 L40 18 Z" fill="url(#cyber-fox)" stroke="#22d3ee" strokeWidth="0.8" />
      {/* inner ear */}
      <path d="M19 20 L15 10 L23 17 Z" fill="#1e1b4b" opacity="0.7" />
      <path d="M45 20 L49 10 L41 17 Z" fill="#1e1b4b" opacity="0.7" />
      {/* eyes */}
      <ellipse cx="25" cy="32" rx="3.5" ry="4" fill="#0f172a" />
      <ellipse cx="39" cy="32" rx="3.5" ry="4" fill="#0f172a" />
      <circle cx="25.5" cy="31.5" r="1.4" fill="#22d3ee" filter="url(#cyber-glow-f)" />
      <circle cx="39.5" cy="31.5" r="1.4" fill="#22d3ee" filter="url(#cyber-glow-f)" />
      {/* snout */}
      <ellipse cx="32" cy="40" rx="7" ry="5" fill="#1e1b4b" />
      <ellipse cx="32" cy="39" rx="3" ry="2" fill="#22d3ee" opacity="0.5" />
      {/* circuit lines */}
      <path d="M20 28 H28 M36 28 H44 M22 36 Q32 42 42 36" fill="none" stroke="url(#cyber-glow)" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="20" cy="28" r="1.2" fill="#22d3ee" />
      <circle cx="44" cy="28" r="1.2" fill="#22d3ee" />
      {/* jaw line */}
      <path d="M24 44 Q32 50 40 44" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
    </svg>
  );
}
