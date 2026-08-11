import LayoutPolishedPreview from './LayoutPolishedPreview'
import {
  buildPackSlidePreviewSchema,
  resolveLayoutSchemaById,
} from '../../utils/deckLayoutRegistry'
import { aspectRatioToCss, deckPackThemeToCssVars, resolveDeckPackTheme } from '../../utils/deckPackTheme'

/**
 * Renders a deck-pack slide using its layout schema (Gamma-style preview).
 * Prefers saved backend layout schema; falls back to legacy registry only when needed.
 */
export default function PackSlidePreview({
  slide,
  layoutSchema = null,
  layoutSchemaMap = {},
  index = 0,
  large = false,
  badgeColor,
  showBadge = true,
  theme,
  themeId,
  aspectRatio = '16:9',
}) {
  const base =
    layoutSchema ||
    resolveLayoutSchemaById(slide?.layout_id, layoutSchemaMap)
  if (!base) return null

  const schema = buildPackSlidePreviewSchema(base, slide)
  if (!schema) return null

  const packTheme = theme || resolveDeckPackTheme(themeId)
  const accent = badgeColor || packTheme.accent
  const cssAspect = aspectRatioToCss(aspectRatio)

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: cssAspect,
        position: 'relative',
        overflow: 'hidden',
        background: packTheme.bg,
        ...deckPackThemeToCssVars(packTheme),
      }}
    >
      <LayoutPolishedPreview schema={schema} large={large} fill aspectRatio={aspectRatio} />
      {showBadge && (
        <div
          style={{
            position: 'absolute',
            top: large ? 10 : 4,
            right: large ? 10 : 4,
            zIndex: 5,
            padding: large ? '3px 9px' : '1px 5px',
            borderRadius: 99,
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            fontSize: large ? '0.7rem' : '0.28rem',
            fontWeight: 700,
            color: accent,
          }}
        >
          {slide?.order ?? index + 1}
        </div>
      )}
    </div>
  )
}
