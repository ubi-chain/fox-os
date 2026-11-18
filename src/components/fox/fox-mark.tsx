/** Key-fox cyber emblem — transparent plate. All desk icons / boot / login / taskbar. */
export function FoxMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`fox-mark ${className}`.trim()}
      viewBox="0 0 128 128"
      width="48"
      height="48"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kf-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="55%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="kf-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>
      {/* outer hex — stroke only, transparent fill */}
      <polygon
        points="64,6 112,34 112,94 64,122 16,94 16,34"
        fill="none"
        stroke="url(#kf-line)"
        strokeWidth="2.2"
      />
      <polygon
        points="64,14 104,38 104,90 64,114 24,90 24,38"
        fill="none"
        stroke="#64748b"
        strokeWidth="1"
        opacity="0.7"
      />
      {/* circuit accents */}
      <path
        d="M28 48 H42 M86 48 H100 M32 72 H48 M80 72 H96 M40 30 L48 38 M88 30 L80 38"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1.1"
        opacity="0.9"
      />
      <circle cx="28" cy="48" r="1.6" fill="#fbbf24" />
      <circle cx="100" cy="48" r="1.6" fill="#fbbf24" />
      <circle cx="64" cy="18" r="1.8" fill="#ef4444" />
      {/* fox head */}
      <path
        d="M64 34 L78 42 L86 58 L78 78 L64 88 L50 78 L42 58 L50 42 Z"
        fill="url(#kf-plate)"
        stroke="#f8fafc"
        strokeWidth="0.6"
      />
      {/* ears */}
      <path d="M50 42 L40 22 L54 40 Z" fill="url(#kf-plate)" stroke="#334155" strokeWidth="0.5" />
      <path d="M78 42 L88 22 L74 40 Z" fill="url(#kf-plate)" stroke="#334155" strokeWidth="0.5" />
      <path d="M48 38 L44 28 L52 36 Z" fill="#0f172a" opacity="0.55" />
      <path d="M80 38 L84 28 L76 36 Z" fill="#0f172a" opacity="0.55" />
      {/* eyes */}
      <ellipse cx="54" cy="56" rx="4" ry="3.2" fill="#0f172a" />
      <ellipse cx="74" cy="56" rx="4" ry="3.2" fill="#0f172a" />
      <ellipse cx="54.8" cy="55.2" rx="1.5" ry="1.2" fill="#ef4444" />
      <ellipse cx="74.8" cy="55.2" rx="1.5" ry="1.2" fill="#ef4444" />
      {/* snout */}
      <path d="M64 62 L70 72 L64 78 L58 72 Z" fill="#e2e8f0" />
      <ellipse cx="64" cy="74" rx="3.2" ry="2.4" fill="#0f172a" />
      {/* key through mouth */}
      <g stroke="#f8fafc" strokeWidth="1.6" fill="none">
        <circle cx="42" cy="76" r="5.5" />
        <circle cx="42" cy="76" r="2.2" />
        <path d="M47.5 76 H86" />
        <path d="M80 76 V82 H84 M84 76 V80" />
      </g>
      <path d="M47.5 76 H86" stroke="#94a3b8" strokeWidth="0.7" />
    </svg>
  );
}
