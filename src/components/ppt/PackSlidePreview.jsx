import CanvasElementsPreview from './CanvasElementsPreview'
import LayoutPolishedPreview from './LayoutPolishedPreview'
import {
  buildPackSlidePreviewSchema,
  resolveLayoutSchemaById,
  resolveSlideMediaFromPack,
} from '../../utils/deckLayoutRegistry'
import { aspectRatioToCss, deckPackThemeToCssVars, resolveDeckPackTheme } from '../../utils/deckPackTheme'
import { slideHasCanvasElements } from '../../utils/videoTemplateToCanvasElements'

/**
 * Renders a deck-pack slide from baked canvas elements (video template fidelity)
 * or from its layout schema (Gamma-style preview).
 */
export default function PackSlidePreview({
  slide,
  layoutSchema = null,
  layoutSchemaMap = {},
  index = 0,
  large = false,
  fill = false,
  badgeColor,
  showBadge = true,
  theme,
  themeId,
  aspectRatio = '16:9',
  className,
  style,
  imageUrl = '',
  imageUrls = null,
  media = null,
}) {
  const packTheme = theme || resolveDeckPackTheme(themeId)
  const accent = badgeColor || packTheme.accent
  const cssAspect = aspectRatioToCss(aspectRatio)
  const frameStyle = fill
    ? { width: '100%', height: '100%', aspectRatio: 'unset', minHeight: 0 }
    : { width: '100%', aspectRatio: cssAspect }

  const slideOrder = slide?.order ?? index + 1
  const resolvedMedia = media?.length
    ? resolveSlideMediaFromPack(media, slideOrder)
    : { imageUrl, imageUrls: imageUrls || {} }

  const badge = showBadge ? (
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
  ) : null

  if (slideHasCanvasElements(slide)) {
    return (
      <div
        className={className}
        style={{
          ...frameStyle,
          position: 'relative',
          overflow: 'hidden',
          ...style,
        }}
      >
        <CanvasElementsPreview
          slide={slide}
          aspectRatio={aspectRatio}
          fallbackBg={slide.backgroundColor || packTheme.bg}
          fill
        />
        {badge}
      </div>
    )
  }

  const base =
    layoutSchema ||
    resolveLayoutSchemaById(slide?.layout_id, layoutSchemaMap)
  if (!base) return null

  const schema = buildPackSlidePreviewSchema(base, slide, resolvedMedia)
  if (!schema) return null

  return (
    <div
      className={className}
      style={{
        ...frameStyle,
        position: 'relative',
        overflow: 'hidden',
        background: packTheme.bg,
        ...deckPackThemeToCssVars(packTheme),
        ...style,
      }}
    >
      <LayoutPolishedPreview schema={schema} large={large} fill aspectRatio={aspectRatio} />
      {badge}
    </div>
  )
}
