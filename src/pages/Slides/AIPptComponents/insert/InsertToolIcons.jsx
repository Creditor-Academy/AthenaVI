/** Custom insert-toolbar glyphs (Gamma-style media + shape). */

function svgProps({ size = 18, className = '', ...rest }) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    'aria-hidden': true,
    ...rest,
  }
}

export function InsertMediaIcon({ size = 18, className = '', ...props }) {
  return (
    <svg
      {...svgProps({ size, className, ...props })}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="4" width="10.5" height="10.5" rx="2.2" />
      <path d="M6 12.2 8.1 9.4 9.6 11 12.1 8.2" />
      <circle cx="11.8" cy="6.8" r="0.85" fill="currentColor" stroke="none" />

      <rect x="10" y="9.5" width="10.5" height="10.5" rx="2.2" />
      <path d="M13.4 12.6 17.1 14.75 13.4 16.9 Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InsertShapeIcon({ size = 18, className = '', ...props }) {
  return (
    <svg
      {...svgProps({ size, className, ...props })}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11 7.5 5 11 11Z" />
      <circle cx="18" cy="7.5" r="2.6" />
      <rect x="4" y="14.5" width="5.2" height="5.2" rx="0.6" />
      <path d="M18 12.8 21.2 14.6 21.2 18.2 18 20 14.8 18.2 14.8 14.6Z" />
    </svg>
  )
}
