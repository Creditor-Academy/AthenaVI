import './AuthShellBubbles.css'

/* Positions in a 100×100 grid — radii chosen so bubbles do not overlap */
const BUBBLES = [
  { cx: 11, cy: 13, r: 11, color: 0 },
  { cx: 89, cy: 11, r: 12, color: 1 },
  { cx: 12, cy: 88, r: 10, color: 2 },
  { cx: 88, cy: 86, r: 11, color: 3 },
  { cx: 50, cy: 93, r: 9, color: 0 },
  { cx: 50, cy: 10, r: 8, color: 1 },
  { cx: 8, cy: 50, r: 8, color: 2 },
  { cx: 92, cy: 52, r: 8, color: 3 },
  { cx: 28, cy: 32, r: 7, color: 0 },
  { cx: 72, cy: 68, r: 7, color: 1 },
]

const BUBBLE_COLORS = [
  'rgba(10, 37, 64, 0.24)',
  'rgba(12, 48, 86, 0.22)',
  'rgba(15, 58, 99, 0.20)',
  'rgba(20, 79, 138, 0.18)',
]

function AuthShellBubbles() {
  return (
    <svg
      className="auth-shell-bubbles"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {BUBBLES.map((bubble, i) => (
        <circle
          key={i}
          className="auth-shell-bubble"
          cx={bubble.cx}
          cy={bubble.cy}
          r={bubble.r}
          fill={BUBBLE_COLORS[bubble.color]}
          style={{
            animationDelay: `${i * 2.5}s`,
            animationDuration: `${22 + (i % 4) * 3}s`,
          }}
        />
      ))}
    </svg>
  )
}

export default AuthShellBubbles
