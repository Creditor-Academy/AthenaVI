/** Renders smart alignment guide lines during text drag. */

const TextSmartGuidesOverlay = ({ guides = [], displayScale = 1 }) => {
  if (!guides.length) return null;

  return (
    <svg
      className="text-smart-guides"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 45,
        overflow: 'visible',
      }}
      aria-hidden
    >
      {guides.map((g, i) =>
        g.type === 'v' ? (
          <line
            key={`v-${i}`}
            x1={g.x * displayScale}
            y1={g.y1 * displayScale}
            x2={g.x * displayScale}
            y2={g.y2 * displayScale}
            stroke="#ec4899"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ) : (
          <line
            key={`h-${i}`}
            x1={g.x1 * displayScale}
            y1={g.y * displayScale}
            x2={g.x2 * displayScale}
            y2={g.y * displayScale}
            stroke="#ec4899"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )
      )}
    </svg>
  );
};

export default TextSmartGuidesOverlay;
