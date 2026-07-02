/** Smart alignment guides for text layer dragging (Canva-style). */

import { getTextClipBounds } from './textCanvasTransform';

const SNAP_THRESHOLD = 6;

/**
 * @param {{ x: number, y: number, width: number, height: number }} moving
 * @param {Array} otherClips - other text clips
 * @param {{ width: number, height: number }} composition
 */
export function computeTextSmartGuides(moving, otherClips, composition, excludeId) {
  const guides = [];
  let snapDx = 0;
  let snapDy = 0;
  let bestDx = SNAP_THRESHOLD + 1;
  let bestDy = SNAP_THRESHOLD + 1;

  const m = {
    left: moving.x,
    right: moving.x + moving.width,
    top: moving.y,
    bottom: moving.y + moving.height,
    centerX: moving.x + moving.width / 2,
    centerY: moving.y + moving.height / 2,
  };

  const canvasTargets = {
    centerX: composition.width / 2,
    centerY: composition.height / 2,
    left: 0,
    right: composition.width,
    top: 0,
    bottom: composition.height,
  };

  const addVerticalGuide = (x, kind) => {
    guides.push({ type: 'v', x, y1: 0, y2: composition.height, kind });
  };
  const addHorizontalGuide = (y, kind) => {
    guides.push({ type: 'h', y, x1: 0, x2: composition.width, kind });
  };

  const trySnapX = (delta, x, kind) => {
    const ad = Math.abs(delta);
    if (ad <= SNAP_THRESHOLD && ad < bestDx) {
      bestDx = ad;
      snapDx = delta;
    }
    if (ad <= SNAP_THRESHOLD) addVerticalGuide(x, kind);
  };

  const trySnapY = (delta, y, kind) => {
    const ad = Math.abs(delta);
    if (ad <= SNAP_THRESHOLD && ad < bestDy) {
      bestDy = ad;
      snapDy = delta;
    }
    if (ad <= SNAP_THRESHOLD) addHorizontalGuide(y, kind);
  };

  // Canvas center / edges
  trySnapX(canvasTargets.centerX - m.centerX, canvasTargets.centerX, 'canvas-center');
  trySnapY(canvasTargets.centerY - m.centerY, canvasTargets.centerY, 'canvas-center');
  trySnapX(canvasTargets.left - m.left, canvasTargets.left, 'canvas-edge');
  trySnapX(canvasTargets.right - m.right, canvasTargets.right, 'canvas-edge');
  trySnapY(canvasTargets.top - m.top, canvasTargets.top, 'canvas-edge');
  trySnapY(canvasTargets.bottom - m.bottom, canvasTargets.bottom, 'canvas-edge');

  const others = otherClips
    .filter((c) => c.id !== excludeId)
    .map(getTextClipBounds);

  for (const o of others) {
    trySnapX(o.centerX - m.centerX, o.centerX, 'center');
    trySnapY(o.centerY - m.centerY, o.centerY, 'center');
    trySnapX(o.left - m.left, o.left, 'edge');
    trySnapX(o.right - m.right, o.right, 'edge');
    trySnapX(o.left - m.right, o.left, 'edge');
    trySnapX(o.right - m.left, o.right, 'edge');
    trySnapY(o.top - m.top, o.top, 'edge');
    trySnapY(o.bottom - m.bottom, o.bottom, 'edge');
    trySnapY(o.top - m.bottom, o.top, 'edge');
    trySnapY(o.bottom - m.top, o.bottom, 'edge');
  }

  return {
    guides,
    snapDx: bestDx <= SNAP_THRESHOLD ? snapDx : 0,
    snapDy: bestDy <= SNAP_THRESHOLD ? snapDy : 0,
  };
}
