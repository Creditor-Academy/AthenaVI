const TICK_COUNT = 32
// Fan spans a near-full circle, leaving a small gap at the bottom (like a speed dial).
const START_ANGLE = -222
const SWEEP = 264

/**
 * Decorative radial "dial" made of discrete pill ticks — filled ticks (in a
 * light->dark single-hue ramp) represent the percentage, unfilled ticks stay
 * on the recessive track color. Center carries the headline number.
 */
function RadialFanGauge({ percent, size = 176, label, sublabel }) {
  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0
  const filledCount = Math.round((clamped / 100) * TICK_COUNT)
  const radius = size / 2
  const tickInset = radius * 0.16

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = START_ANGLE + (i / (TICK_COUNT - 1)) * SWEEP
    const isFilled = i < filledCount
    // Lightness ramps from the lighter primary tint to full primary across filled ticks.
    const t = filledCount > 1 ? i / (filledCount - 1) : 1
    const tint = 55 - t * 55
    return (
      <span
        key={i}
        className={`dash-gauge-tick${isFilled ? ' dash-gauge-tick--filled' : ''}`}
        style={{
          transform: `rotate(${angle}deg) translateY(-${radius - tickInset}px)`,
          ...(isFilled ? { background: `color-mix(in srgb, white ${tint}%, var(--primary))` } : {}),
        }}
      />
    )
  })

  return (
    <div className="dash-gauge" style={{ width: size, height: size }}>
      <div className="dash-gauge-ticks" style={{ width: size, height: size }}>
        {ticks}
      </div>
      <div className="dash-gauge-center">
        <span className="dash-gauge-value">{label}</span>
        {sublabel && <span className="dash-gauge-sublabel">{sublabel}</span>}
      </div>
    </div>
  )
}

export default RadialFanGauge
