const SIDE_LABELS = {
  3: 'Triangle',
  4: 'Diamond',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
  9: 'Nonagon',
  10: 'Decagon',
};

export function getPolygonSideLabel(sides) {
  return SIDE_LABELS[sides] || `${sides} sides`;
}

export function buildRegularPolygonClipPath(sides, { startAngle = -Math.PI / 2 } = {}) {
  const count = Math.max(3, Math.min(10, Math.round(Number(sides) || 3)));
  const points = [];

  for (let i = 0; i < count; i += 1) {
    const angle = startAngle + (i * 2 * Math.PI) / count;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }

  return `polygon(${points.join(', ')})`;
}

export function buildRoundedPolygonClipPath(sides, cornerRadiusPx = 8, width = 100, height = 100) {
  const count = Math.max(3, Math.min(10, Math.round(Number(sides) || 3)));
  const startAngle = -Math.PI / 2;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2;
  const corner = Math.max(0, Math.min(cornerRadiusPx, radius * 0.4));
  const points = [];

  for (let i = 0; i < count; i += 1) {
    const angle = startAngle + (i * 2 * Math.PI) / count;
    const px = cx + (radius - corner) * Math.cos(angle);
    const py = cy + (radius - corner) * Math.sin(angle);
    points.push(`${((px / width) * 100).toFixed(2)}% ${((py / height) * 100).toFixed(2)}%`);
  }

  return `polygon(${points.join(', ')})`;
}

export function applyShapeBorderRadius(style = {}, radiusPx = 0, size = {}) {
  const width = Number(size.width) || 100;
  const height = Number(size.height) || 100;
  const sides = Number(style.polygonSides);
  if (sides >= 3 && sides <= 10 && radiusPx > 0) {
    const clipPath = buildRoundedPolygonClipPath(sides, radiusPx, width, height);
    return {
      ...style,
      borderRadius: '0px',
      clipPath,
      WebkitClipPath: clipPath,
      polygonSides: sides,
    };
  }
  if (style.clipPath && radiusPx > 0) {
    return { ...style, borderRadius: `${radiusPx}px` };
  }
  return { ...style, borderRadius: `${radiusPx}px` };
}

export function isPolygonMaskStyle(style) {
  const sides = Number(style?.polygonSides);
  return sides >= 3 && sides <= 10;
}
