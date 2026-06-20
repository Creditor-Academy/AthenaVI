function FontsSpecimenIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      xmlns="http://www.w3.org/2000/svg"
      className="library-cs-illustration"
      aria-hidden
    >
      <defs>
        <linearGradient id="lcs-fontsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary-dark, #1d4ed8)" stopOpacity="1" />
        </linearGradient>
      </defs>

      <rect
        x="24"
        y="20"
        width="192"
        height="160"
        rx="14"
        fill="var(--bg-card)"
        stroke="var(--border-color)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        className="library-cs-frame"
      />

      <text
        x="48"
        y="72"
        fontSize="44"
        fontWeight="800"
        fill="url(#lcs-fontsGrad)"
        className="library-cs-float-a"
      >
        A
      </text>
      <text
        x="108"
        y="88"
        fontSize="36"
        fontWeight="600"
        fill="var(--primary)"
        opacity="0.55"
        className="library-cs-float-a library-cs-float-a--delay"
      >
        a
      </text>

      <line x1="48" y1="108" x2="192" y2="108" stroke="var(--border-color)" strokeWidth="1" />
      <rect x="48" y="120" width="120" height="8" rx="4" fill="var(--primary)" opacity="0.22" />
      <rect x="48" y="136" width="96" height="6" rx="3" fill="var(--text-muted)" opacity="0.2" />
      <rect x="48" y="150" width="108" height="6" rx="3" fill="var(--text-muted)" opacity="0.14" />
      <rect x="48" y="164" width="72" height="6" rx="3" fill="var(--text-muted)" opacity="0.1" />

      <circle cx="196" cy="36" r="4" fill="var(--primary)" opacity="0.35" className="library-cs-dot library-cs-dot--1" />
      <circle cx="36" cy="168" r="3" fill="var(--primary)" opacity="0.25" className="library-cs-dot library-cs-dot--2" />
    </svg>
  )
}

function TemplatesWireframeIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      xmlns="http://www.w3.org/2000/svg"
      className="library-cs-illustration"
      aria-hidden
    >
      <rect x="28" y="24" width="184" height="152" rx="12" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5" />

      <g className="library-cs-wire-card library-cs-wire-card--back">
        <rect x="44" y="40" width="152" height="88" rx="10" fill="var(--bg-surface)" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="5 3" />
        <rect x="56" y="52" width="56" height="40" rx="6" fill="var(--primary)" opacity="0.12" />
        <rect x="120" y="56" width="64" height="6" rx="3" fill="var(--text-muted)" opacity="0.2" />
        <rect x="120" y="70" width="48" height="6" rx="3" fill="var(--text-muted)" opacity="0.14" />
      </g>

      <g className="library-cs-wire-card library-cs-wire-card--front">
        <rect x="56" y="72" width="152" height="88" rx="10" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2" opacity="0.95" />
        <rect x="68" y="84" width="64" height="44" rx="6" fill="var(--primary)" opacity="0.15" />
        <rect x="140" y="88" width="56" height="6" rx="3" fill="var(--primary)" opacity="0.35" />
        <rect x="140" y="102" width="40" height="6" rx="3" fill="var(--text-muted)" opacity="0.2" />
        <rect x="68" y="140" width="128" height="6" rx="3" fill="var(--text-muted)" opacity="0.12" />
      </g>

      <circle cx="52" cy="48" r="3" fill="var(--primary)" opacity="0.4" className="library-cs-dot library-cs-dot--1" />
      <circle cx="188" cy="160" r="3" fill="var(--primary)" opacity="0.3" className="library-cs-dot library-cs-dot--2" />
      <line x1="200" y1="72" x2="200" y2="152" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
      <line x1="56" y1="168" x2="208" y2="168" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
    </svg>
  )
}

function LibraryComingSoonIllustration({ category = 'templates' }) {
  if (category === 'fonts') {
    return <FontsSpecimenIllustration />
  }
  return <TemplatesWireframeIllustration />
}

export default LibraryComingSoonIllustration
