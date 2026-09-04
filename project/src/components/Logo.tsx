interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e89bb5" />
          <stop offset="50%" stopColor="#9e617c" />
          <stop offset="100%" stopColor="#7a4a61" />
        </linearGradient>
        <linearGradient id="logo-screen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#36e2c4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#9e617c" stopOpacity="0.15" />
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer hex frame */}
      <path
        d="M50 4 L88 26 L88 74 L50 96 L12 74 L12 26 Z"
        stroke="url(#logo-grad)"
        strokeWidth="3"
        strokeLinejoin="round"
        filter="url(#logo-glow)"
      />

      {/* Inner hex frame */}
      <path
        d="M50 12 L80 29 L80 71 L50 88 L20 71 L20 29 Z"
        stroke="#9e617c"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* CRT screen */}
      <rect
        x="30"
        y="32"
        width="40"
        height="28"
        rx="3"
        fill="url(#logo-screen-grad)"
        stroke="#9e617c"
        strokeWidth="1.5"
      />

      {/* Scan lines on screen */}
      <line x1="30" y1="40" x2="70" y2="40" stroke="#9e617c" strokeWidth="0.5" opacity="0.4" />
      <line x1="30" y1="46" x2="70" y2="46" stroke="#9e617c" strokeWidth="0.5" opacity="0.4" />
      <line x1="30" y1="52" x2="70" y2="52" stroke="#9e617c" strokeWidth="0.5" opacity="0.4" />

      {/* Sassy mouth on screen */}
      <path
        d="M38 50 Q50 56 62 50"
        stroke="#f0c36d"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes on screen */}
      <circle cx="42" cy="44" r="1.8" fill="#36e2c4" />
      <circle cx="58" cy="44" r="1.8" fill="#36e2c4" />

      {/* Antenna left */}
      <line x1="38" y1="32" x2="30" y2="20" stroke="#9e617c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="29" cy="18" r="2.5" fill="#36e2c4" filter="url(#logo-glow)" />

      {/* Antenna right */}
      <line x1="62" y1="32" x2="70" y2="20" stroke="#9e617c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="71" cy="18" r="2.5" fill="#f0c36d" filter="url(#logo-glow)" />

      {/* Base stand */}
      <rect x="42" y="60" width="16" height="6" rx="1" fill="#9e617c" opacity="0.6" />
      <rect x="36" y="66" width="28" height="4" rx="2" fill="#9e617c" opacity="0.4" />

      {/* Circuit lines */}
      <line x1="14" y1="50" x2="24" y2="50" stroke="#9e617c" strokeWidth="1" opacity="0.4" />
      <circle cx="14" cy="50" r="1.5" fill="#9e617c" opacity="0.5" />
      <line x1="76" y1="50" x2="86" y2="50" stroke="#9e617c" strokeWidth="1" opacity="0.4" />
      <circle cx="86" cy="50" r="1.5" fill="#9e617c" opacity="0.5" />
    </svg>
  );
}
