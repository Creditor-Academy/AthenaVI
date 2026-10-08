import { resolveTextHex } from './pptTextContent'

export const SHAPE_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'curve', label: 'Curve' },
  { id: 'circle', label: 'Circle' },
]

export const STYLE_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'lift', label: 'Lift' },
  { id: 'hollow', label: 'Hollow' },
  { id: 'splice', label: 'Splice' },
  { id: 'outline', label: 'Outline' },
  { id: 'echo', label: 'Echo' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'neon', label: 'Neon' },
  { id: 'background', label: 'Background' },
]

export function buildTextEffectStyle(content = {}, palette = {}, fallbackColor = '#172033') {
  const effect = content.textEffect || 'none'
  const baseColor = resolveTextHex(content, palette) || fallbackColor

  switch (effect) {
    case 'shadow': {
      const angle = (content.shadowAngle != null ? content.shadowAngle : 45) * (Math.PI / 180)
      const offset = content.shadowOffset != null ? content.shadowOffset : 4
      const blur = content.shadowBlur != null ? content.shadowBlur : 4
      const color = content.shadowColor || 'rgba(0, 0, 0, 0.45)'
      const dx = Math.round(Math.cos(angle) * offset)
      const dy = Math.round(Math.sin(angle) * offset)
      return {
        textShadow: `${dx}px ${dy}px ${blur}px ${color}`,
      }
    }
    case 'lift': {
      const intensity = (content.liftIntensity != null ? content.liftIntensity : 50) / 100
      const blur1 = Math.round(4 + intensity * 8)
      const blur2 = Math.round(8 + intensity * 20)
      const alpha1 = (0.2 + intensity * 0.35).toFixed(2)
      const alpha2 = (0.1 + intensity * 0.25).toFixed(2)
      return {
        textShadow: `0 ${Math.round(blur1 / 2)}px ${blur1}px rgba(0, 0, 0, ${alpha1}), 0 ${Math.round(blur2 / 2)}px ${blur2}px rgba(0, 0, 0, ${alpha2})`,
      }
    }
    case 'hollow': {
      const thickness = content.hollowThickness != null ? content.hollowThickness : 2
      const strokeColor = content.hollowColor || baseColor
      return {
        WebkitTextStroke: `${thickness}px ${strokeColor}`,
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
      }
    }
    case 'splice': {
      const thickness = content.spliceThickness != null ? content.spliceThickness : 2
      const strokeColor = content.spliceStrokeColor || baseColor
      const shadowColor = content.spliceColor || '#3B82F6'
      const offset = content.spliceOffset != null ? content.spliceOffset : 3
      return {
        WebkitTextStroke: `${thickness}px ${strokeColor}`,
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        textShadow: `${offset}px ${offset}px 0 ${shadowColor}`,
      }
    }
    case 'outline': {
      const thickness = content.outlineThickness != null ? content.outlineThickness : 2
      const strokeColor = content.outlineColor || '#000000'
      return {
        WebkitTextStroke: `${thickness}px ${strokeColor}`,
        paintOrder: 'stroke fill',
      }
    }
    case 'echo': {
      const offset = content.echoOffset != null ? content.echoOffset : 3
      const echoColor = content.echoColor || '#6366F1'
      return {
        textShadow: `${offset}px ${offset}px 0 ${echoColor}, ${offset * 2}px ${offset * 2}px 0 ${echoColor}99, ${offset * 3}px ${offset * 3}px 0 ${echoColor}44`,
      }
    }
    case 'glitch': {
      const offset = content.glitchOffset != null ? content.glitchOffset : 3
      return {
        textShadow: `-${offset}px 0 #00ffff, ${offset}px ${Math.round(offset / 2)}px #ff00ff`,
      }
    }
    case 'neon': {
      const intensity = (content.neonIntensity != null ? content.neonIntensity : 70) / 100
      const neonColor = content.neonColor || baseColor || '#EC4899'
      const r1 = Math.round(3 + intensity * 4)
      const r2 = Math.round(8 + intensity * 10)
      const r3 = Math.round(18 + intensity * 24)
      return {
        textShadow: `0 0 ${r1}px ${neonColor}, 0 0 ${r2}px ${neonColor}, 0 0 ${r3}px ${neonColor}`,
      }
    }
    case 'background': {
      const bg = content.textBgColor || '#FEF08A'
      const radius = content.textBgRadius != null ? content.textBgRadius : 8
      const pad = content.textBgPadding != null ? content.textBgPadding : 6
      return {
        backgroundColor: bg,
        borderRadius: `${radius}px`,
        padding: `${pad}px ${pad * 1.5}px`,
        display: 'inline-block',
      }
    }
    default:
      return {}
  }
}

/**
 * Compute SVG arc / circle path for curved text
 */
export function computeCurvedTextSvgPath(width, height, curveAmount = 50) {
  const w = Math.max(60, width || 200)
  const h = Math.max(30, height || 60)
  const cx = w / 2
  const cy = h / 2

  if (Math.abs(curveAmount) >= 95) {
    // Full 360 circle
    const r = Math.max(20, Math.min(w, h) * 0.42)
    return curveAmount > 0
      ? `M ${cx}, ${cy - r} a ${r},${r} 0 1,1 0,${r * 2} a ${r},${r} 0 1,1 0,-${r * 2}`
      : `M ${cx}, ${cy + r} a ${r},${r} 0 1,0 0,-${r * 2} a ${r},${r} 0 1,0 0,${r * 2}`
  }

  // Smooth quadratic bezier arc from left to right
  const norm = curveAmount / 100 // -1 to +1
  const startY = cy + norm * (h * 0.35)
  const endY = startY
  const controlY = cy - norm * (h * 0.75)

  return `M 4,${startY} Q ${cx},${controlY} ${w - 4},${endY}`
}
