const CanvasGuidesOverlay = ({
  width = 1920,
  height = 1080,
  showGrid = true,
  showSafeZone = true,
  gridSize = 20,
}) => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 2,
    }}
  >
    {showGrid && (
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="editor-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#editor-grid)" />
      </svg>
    )}

    {showSafeZone && (
      <div
        style={{
          position: 'absolute',
          left: '5%',
          top: '5%',
          width: '90%',
          height: '90%',
          border: '1px dashed rgba(99,102,241,0.45)',
          boxSizing: 'border-box',
        }}
      />
    )}

    {/* Center crosshair */}
    {showGrid && (
      <>
        <div
          style={{
            position: 'absolute',
            left: width / 2,
            top: 0,
            width: 1,
            height: '100%',
            background: 'rgba(99,102,241,0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: height / 2,
            width: '100%',
            height: 1,
            background: 'rgba(99,102,241,0.2)',
          }}
        />
      </>
    )}
  </div>
);

export default CanvasGuidesOverlay;
