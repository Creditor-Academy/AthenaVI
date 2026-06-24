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

export function isPolygonMaskStyle(style) {
  const sides = Number(style?.polygonSides);
  return sides >= 3 && sides <= 10;
}
