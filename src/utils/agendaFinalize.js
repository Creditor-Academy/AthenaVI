/**
 * Agenda layout finalize — per-family routers (mirrors layoutDiagram* pattern).
 */
import {
  agendaChromeSpecs,
  agendaGraphicFrame,
  agendaOverlayPlacements,
  resolveAgendaMeta,
  specToGraphicContent,
  isAgendaThreeColumnColouredLayout,
} from './agendaInfographicSvg.js'
import {
  agendaThreeColumnGraphicFrame,
  colouredColumnTextContent,
  isAgendaThreeColumnTextSlot,
  specToThreeColumnContent,
} from './agendaThreeColumn.js'
import {
  agendaThreeCardsGraphicFrame,
  agendaThreeCardsChromeSpecs,
  isAgendaThreeCardsLayout,
  isAgendaThreeCardsHeroLayout,
  specToThreeCardsContent,
} from './agendaThreeCards.js'
import {
  agendaHeroCardsGraphicFrame,
  isAgendaHeroCardsLayout,
  specToHeroCardsContent,
} from './agendaHeroCards.js'
import {
  agendaNumberedBlocksGraphicFrame,
  isAgendaNumberedBlocksLayout,
  isAgendaNumberedBlocksTextSlot,
  specToNumberedBlocksContent,
} from './agendaNumberedBlocks.js'
import {
  agendaNumberedTimelineGraphicFrame,
  isAgendaNumberedTimelineLayout,
  isAgendaNumberedTimelineTextSlot,
  specToNumberedTimelineContent,
} from './agendaNumberedTimeline.js'
import {
  agendaMinimalQuietGraphicFrame,
  isAgendaMinimalQuietLayout,
  isAgendaMinimalQuietTextSlot,
  specToMinimalQuietContent,
} from './agendaMinimalQuiet.js'
import {
  agendaEditorialGraphicFrame,
  isAgendaEditorialLayout,
  isAgendaEditorialTextSlot,
  specToEditorialContent,
} from './agendaEditorialHub.js'
import {
  agendaCardsGraphicFrame,
  isAgendaCardsLayout,
  isAgendaCardsTextSlot,
  specToAgendaCardsContent,
} from './agendaCardsTiles.js'
import {
  agendaTwoColumnRibbonGraphicFrame,
  isAgendaTwoColumnRibbonLayout,
  isAgendaTwoColumnRibbonTextSlot,
  specToTwoColumnRibbonContent,
} from './agendaTwoColumnRibbons.js'
import {
  agendaSplitPanelGraphicFrame,
  agendaSplitPanelImageClip,
  isAgendaSplitPanelLayout,
  isAgendaSplitPanelTextSlot,
  specToSplitPanelContent,
} from './agendaSplitPanel.js'

import {
  agendaTimelineHexGraphicFrame,
  isAgendaTimelineHexLayout,
  isAgendaTimelineHexTextSlot,
  specToTimelineHexContent,
} from './agendaTimelineHex.js'
import {
  agendaVerticalRoadmapGraphicFrame,
  isAgendaVerticalRoadmapLayout,
  isAgendaVerticalRoadmapTextSlot,
  specToVerticalRoadmapContent,
  VR_PALETTE,
} from './agendaVerticalRoadmap.js'

const AGENDA_CHROME_RE = /^AGENDA_(INFOGRAPHIC_CHROME|SPINE|PATH|SPLIT_LINE|TIMELINE|CURVE|TITLE_BLOCK|VISUAL_BLOCK|ZONE_|PANEL_|CARD_|ICON_|BADGE_|DIVIDER_|ARROW_|NODE_|COL_BLOCK_|COL_BAND_|COL_ICON_|COL_NUM_|COL_RULE|COL_CHROME_|NUM_CHROME_|NUM_TL_|MIN_|ED_|CRD_|TC_|SP_|TLH_|VR_)/i

function paletteColor(palette, role, fallback) {
  const v = palette?.[role] || palette?.colors?.[role]
  return v || fallback
}

function newShapeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function textBase(el) {
  return {
    ...(el.content || {}),
    letterSpacing: '0',
    padding: 0,
    paddingX: 0,
    stroke: undefined,
    strokeWidth: 0,
  }
}

function repositionAgendaTextElements(elements, overlay, options) {
  const { textColor, columnTextColor, isColouredThreeCol, isThreeCards, isThreeCardsHero, isHeroCards, isNumberedBlocks, isNumberedTimeline, isMinimalQuiet, isEditorial, isAgendaCards, isTwoColRibbon, isSplitPanel, isTimelineHex, isVerticalRoadmap, headingY, headingH, canvasW } = options
  const isRibbonCards = isThreeCards || isThreeCardsHero
  const stacked = isColouredThreeCol || isRibbonCards || isHeroCards || isNumberedBlocks || isNumberedTimeline
  return elements.map((el) => {
    const sid = String(el.slotId || '')
    const base = textBase(el)
    if (sid.toUpperCase() === 'HEADING') {
      const h = isRibbonCards || isHeroCards || isNumberedBlocks || isNumberedTimeline || isMinimalQuiet || isEditorial || isAgendaCards || isTwoColRibbon || isSplitPanel || isTimelineHex || isVerticalRoadmap
        ? (overlay.heading || { x: Math.round(canvasW * 0.06), y: headingY, width: Math.round(canvasW * 0.88), height: headingH })
        : stacked
        ? { x: Math.round(canvasW * 0.06), y: headingY, width: Math.round(canvasW * 0.88), height: headingH }
        : (overlay.heading || { x: 72, y: headingY, width: canvasW - 144, height: headingH })
      return {
        ...el,
        placement: { ...h, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: isTimelineHex || isVerticalRoadmap || isSplitPanel ? 'center' : isTwoColRibbon ? 'left' : stacked ? 'center' : 'left',
          verticalAlign: 'center',
          fontSize: isTimelineHex || isVerticalRoadmap ? 30 : isSplitPanel ? 28 : isTwoColRibbon ? 28 : isEditorial || isAgendaCards ? 32 : isMinimalQuiet ? 44 : isHeroCards || isThreeCardsHero ? 32 : isNumberedBlocks || isNumberedTimeline ? 34 : isThreeCards ? 36 : stacked ? 40 : 36,
          fontWeight: 800,
          color: textColor,
          lineHeight: 1.1,
          clipToSlot: true,
          letterSpacing: isSplitPanel ? '0.08em' : '0',
        },
      }
    }
    if (sid.toUpperCase() === 'SUBHEADING' && isTimelineHex && overlay.subheading) {
      return {
        ...el,
        layer: 12,
        placement: { ...overlay.subheading, rotation: 0, opacity: 1 },
        content: {
          ...base,
          align: 'center',
          verticalAlign: 'center',
          fontSize: 14,
          fontWeight: 500,
          color: '#374151',
          clipToSlot: true,
        },
      }
    }
    const itemBodyM = sid.match(/^ITEM_(\d+)_BODY$/i)
    if (itemBodyM && (isNumberedTimeline || isAgendaCards || isSplitPanel || isTimelineHex || isVerticalRoadmap) && overlay.itemBodies?.length) {
      const box = overlay.itemBodies[Number(itemBodyM[1]) - 1]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: {
            ...colouredColumnTextContent(el.content, {
              color: '#6B7280',
              fontSize: isVerticalRoadmap || isTimelineHex ? 13 : isSplitPanel ? 13 : isAgendaCards ? 14 : 13,
              fontWeight: 400,
              align: 'left',
              verticalAlign: 'flex-start',
            }),
            wrap: 'wrap',
            clipToSlot: true,
            lineHeight: isVerticalRoadmap || isTimelineHex ? 1.45 : 1.35,
          },
        }
      }
    }
    const yearM = sid.match(/^ITEM_(\d+)_YEAR$/i)
    if (yearM && isVerticalRoadmap && overlay.years?.length) {
      const i = Number(yearM[1]) - 1
      const box = overlay.years[i]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: {
            ...colouredColumnTextContent(el.content, {
              color: VR_PALETTE[i % VR_PALETTE.length].main,
              fontSize: 22,
              fontWeight: 800,
              align: 'left',
              verticalAlign: 'center',
            }),
            clipToSlot: true,
            lineHeight: 1,
          },
        }
      }
    }
    const itemM = sid.match(/^ITEM_(\d+)$/i)
    if (itemM && overlay.items?.length) {
      const i = Number(itemM[1]) - 1
      const box = overlay.items[i]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: isNumberedTimeline
            ? {
              ...colouredColumnTextContent(el.content, { color: '#111827', fontSize: 16, fontWeight: 800, align: 'center', verticalAlign: 'center' }),
              wrap: 'wrap',
              clipToSlot: true,
              lineHeight: 1.15,
            }
            : isNumberedBlocks
            ? {
              ...colouredColumnTextContent(el.content, { color: '#4B5563', fontSize: 14, fontWeight: 400, align: 'left', verticalAlign: 'flex-start' }),
              wrap: 'wrap',
              clipToSlot: true,
              lineHeight: 1.35,
            }
            : isMinimalQuiet
            ? {
              ...colouredColumnTextContent(el.content, { color: textColor, fontSize: 22, fontWeight: 600, align: 'left', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1,
            }
            : isEditorial
            ? {
              ...colouredColumnTextContent(el.content, { color: '#ffffff', fontSize: 16, fontWeight: 600, align: 'left', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1,
              padding: 0,
              paddingX: 0,
            }
            : isAgendaCards
            ? {
              ...colouredColumnTextContent(el.content, { color: '#111827', fontSize: 20, fontWeight: 700, align: 'left', verticalAlign: 'center' }),
              wrap: 'wrap',
              clipToSlot: true,
              lineHeight: 1.2,
              padding: 0,
              paddingX: 0,
            }
            : isSplitPanel
            ? {
              ...colouredColumnTextContent(el.content, { color: '#111827', fontSize: 16, fontWeight: 800, align: 'left', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1.1,
              letterSpacing: '0.04em',
            }
            : isVerticalRoadmap
            ? {
              ...colouredColumnTextContent(el.content, { color: '#4B5563', fontSize: 16, fontWeight: 700, align: 'left', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1.1,
            }
            : isTimelineHex
            ? {
              ...colouredColumnTextContent(el.content, { color: '#111827', fontSize: 15, fontWeight: 800, align: 'center', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1.1,
            }
            : { ...base, align: 'left', verticalAlign: 'center', fontSize: 18, fontWeight: 600, color: textColor },
        }
      }
    }
    if (sid.toUpperCase() === 'BODY' && isNumberedBlocks) {
      return el
    }
    if (sid.toUpperCase() === 'BODY' && overlay.items?.length) {
      const box = overlay.items[0]
      return {
        ...el,
        layer: 12,
        placement: {
          x: box.x,
          y: box.y,
          width: overlay.items[overlay.items.length - 1].x + overlay.items[overlay.items.length - 1].width - box.x,
          height: overlay.items.length * 56,
          rotation: 0,
          opacity: 1,
        },
        content: { ...base, align: 'left', verticalAlign: 'flex-start', fontSize: 18, color: textColor },
      }
    }
    const colHeadM = sid.match(/^AGENDA_COL_(\d+)_HEADING$/i)
    if (colHeadM && overlay.columns?.length) {
      const col = overlay.columns[Number(colHeadM[1]) - 1]
      if (col?.heading) {
        return {
          ...el,
          layer: 12,
          placement: { ...col.heading, rotation: 0, opacity: isRibbonCards ? 0 : 1 },
          content: isTwoColRibbon
            ? {
              ...colouredColumnTextContent(el.content, { color: '#ffffff', fontSize: 18, fontWeight: 800, align: 'left', verticalAlign: 'center' }),
              clipToSlot: true,
              lineHeight: 1,
            }
            : isRibbonCards
            ? {
              ...colouredColumnTextContent(el.content, { color: '#ffffff', fontSize: 20, fontWeight: 800, align: 'center', verticalAlign: 'center' }),
              clipToSlot: true,
              lineHeight: 1,
            }
            : isHeroCards
            ? colouredColumnTextContent(el.content, { color: '#111827', fontSize: 20, fontWeight: 800, align: 'center', verticalAlign: 'center' })
            : isColouredThreeCol
            ? colouredColumnTextContent(el.content, { color: '#111827', fontSize: 26, fontWeight: 800, align: 'center', verticalAlign: 'center' })
            : { ...base, align: 'center', fontSize: 20, fontWeight: 800, color: columnTextColor },
        }
      }
    }
    const colBodyM = sid.match(/^AGENDA_COL_(\d+)_ITEM_(\d+)_BODY$/i)
    if (colBodyM && overlay.columns?.length) {
      const col = overlay.columns[Number(colBodyM[1]) - 1]
      const box = col?.itemBodies?.[Number(colBodyM[2]) - 1]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: {
            ...colouredColumnTextContent(el.content, { color: '#6B7280', fontSize: 12, fontWeight: 400, align: 'left', verticalAlign: 'flex-start' }),
            wrap: 'wrap',
            clipToSlot: true,
            lineHeight: 1.3,
          },
        }
      }
    }
    const colItemM = sid.match(/^AGENDA_COL_(\d+)_ITEM_(\d+)$/i)
    if (colItemM && overlay.columns?.length) {
      const col = overlay.columns[Number(colItemM[1]) - 1]
      const box = col?.items?.[Number(colItemM[2]) - 1] || col?.items?.[0]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: isTwoColRibbon
            ? {
              ...colouredColumnTextContent(el.content, { color: '#111827', fontSize: 14, fontWeight: 700, align: 'left', verticalAlign: 'center' }),
              wrap: 'nowrap',
              clipToSlot: true,
              lineHeight: 1.1,
            }
            : isRibbonCards
            ? {
              ...colouredColumnTextContent(el.content, { color: '#4B5563', fontSize: isThreeCardsHero ? 14 : 15, fontWeight: 400, align: 'left', verticalAlign: 'center' }),
              wrap: 'wrap',
              clipToSlot: false,
            }
            : isHeroCards
            ? {
              ...colouredColumnTextContent(el.content, { color: '#4B5563', fontSize: 14, fontWeight: 400, align: 'center', verticalAlign: 'center' }),
              wrap: 'wrap',
              clipToSlot: false,
            }
            : isColouredThreeCol
            ? {
              ...colouredColumnTextContent(el.content, { color: '#6B7280', fontSize: 16, fontWeight: 400, align: 'center', verticalAlign: 'center' }),
              wrap: 'wrap',
              clipToSlot: false,
            }
            : { ...base, align: 'center', fontSize: 15, color: columnTextColor },
        }
      }
    }
    const msM = sid.match(/^milestone_(\d+)_label$/i)
    if (msM && overlay.milestones?.length) {
      const box = overlay.milestones[Number(msM[1]) - 1]
      if (box) {
        return {
          ...el,
          layer: 12,
          placement: { ...box, rotation: 0, opacity: 1 },
          content: { ...base, align: 'center', fontSize: 14, fontWeight: 700, color: textColor },
        }
      }
    }
    return el
  })
}

function injectAgendaChrome(specs, frame, palette, options) {
  const { graphicX, graphicY, graphicW, graphicH } = frame
  const { prevBySlot, accent, soft, isColouredThreeCol, isThreeCards, isThreeCardsHero, isHeroCards, isNumberedBlocks, isNumberedTimeline, isMinimalQuiet, isEditorial, isAgendaCards, isTwoColRibbon, isSplitPanel, isTimelineHex, isVerticalRoadmap } = options
  const isRibbonCards = isThreeCards || isThreeCardsHero
  const sx = graphicW / 1000
  const sy = graphicH / 560
  return specs.map((spec) => {
    const slotId = spec.slotId
    const prev = prevBySlot.get(slotId.toUpperCase())
    const placement = {
      x: Math.round(graphicX + spec.x * sx),
      y: Math.round(graphicY + spec.y * sy),
      width: Math.max(4, Math.round(spec.w * sx)),
      height: Math.max(4, Math.round(spec.h * sy)),
      rotation: 0,
      opacity: 1,
    }
    if (spec.kind === 'shape') {
      return {
        id: prev?.id || newShapeId('shp-agenda'),
        type: 'shape',
        layer: spec.layer || 3,
        placement,
        content: {
          shape: 'rect',
          borderRadius: spec.borderRadius ? Math.round(spec.borderRadius * Math.min(sx, sy)) : 12,
          fill: spec.fill || prev?.content?.fill || soft,
        },
        role: 'decoration',
        slotId,
      }
    }
    const graphic = isHeroCards
      ? specToHeroCardsContent(spec)
      : isRibbonCards
      ? specToThreeCardsContent(spec)
      : isNumberedBlocks
      ? specToNumberedBlocksContent(spec)
      : isNumberedTimeline
      ? specToNumberedTimelineContent(spec)
      : isMinimalQuiet
      ? specToMinimalQuietContent(spec)
      : isEditorial
      ? specToEditorialContent(spec)
      : isAgendaCards
      ? specToAgendaCardsContent(spec)
      : isTwoColRibbon
      ? specToTwoColumnRibbonContent(spec)
      : isSplitPanel
      ? specToSplitPanelContent(spec)
      : isTimelineHex
      ? specToTimelineHexContent(spec)
      : isVerticalRoadmap
      ? specToVerticalRoadmapContent(spec)
      : isColouredThreeCol
        ? specToThreeColumnContent(spec)
        : specToGraphicContent(spec, accent, soft)
    return {
      id: prev?.id || newShapeId('shp-agenda'),
      type: 'graphic',
      layer: spec.layer || 4,
      placement,
      content: { svg: graphic.svg, colorMode: graphic.colorMode || 'recolorable', fill: graphic.fill || accent, alt: slotId },
      role: 'decoration',
      slotId,
    }
  })
}

function columnHeadingLabels(elements) {
  const fallback = ['Morning', 'Afternoon', 'Evening']
  return fallback.map((fb, i) => {
    const el = (elements || []).find((item) => String(item.slotId || '').toUpperCase() === `AGENDA_COL_${i + 1}_HEADING`)
    const c = el?.content || {}
    const text = typeof c.text === 'string'
      ? c.text
      : Array.isArray(c.runs)
        ? c.runs.map((r) => r.text || '').join('')
        : ''
    return String(text).trim() || fb
  })
}

function layoutAgendaFamily(elements, schema, palette = {}, canvas = {}) {
  if (!Array.isArray(elements)) return elements
  const canvasW = canvas.width || 1920
  const canvasH = canvas.height || 1080
  const textColor = paletteColor(palette, 'text', '#1F2937')
  const accent = paletteColor(palette, 'accent', paletteColor(palette, 'primary', '#6366F1'))
  const soft = paletteColor(palette, 'cardBg', 'color-mix(in srgb, #6366f1 12%, #ffffff)')

  const { family, variant } = resolveAgendaMeta(schema)
  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId || ''
  const isColouredThreeCol = isAgendaThreeColumnColouredLayout(layoutId, family, variant)
  const isThreeCards = isAgendaThreeCardsLayout(layoutId, family, variant)
  const isThreeCardsHero = isAgendaThreeCardsHeroLayout(layoutId, family, variant)
  const isHeroCards = isAgendaHeroCardsLayout(layoutId, family, variant)
  const isNumberedBlocks = isAgendaNumberedBlocksLayout(layoutId, family, variant)
  const isNumberedTimeline = isAgendaNumberedTimelineLayout(layoutId, family, variant)
  const isMinimalQuiet = isAgendaMinimalQuietLayout(layoutId, family, variant)
  const isEditorial = isAgendaEditorialLayout(layoutId, family, variant)
  const isAgendaCards = isAgendaCardsLayout(layoutId, family, variant)
  const isTwoColRibbon = isAgendaTwoColumnRibbonLayout(layoutId, family, variant)
  const isSplitPanel = isAgendaSplitPanelLayout(layoutId, family, variant)
  const isTimelineHex = isAgendaTimelineHexLayout(layoutId, family, variant)
  const isVerticalRoadmap = isAgendaVerticalRoadmapLayout(layoutId, family, variant)
  const isRibbonCards = isThreeCards || isThreeCardsHero
  const stacked = isColouredThreeCol || isRibbonCards || isHeroCards || isNumberedBlocks || isNumberedTimeline
  const itemCount = schema?.preview?.agendaItems?.length
    || schema?.preview?.milestones?.length
    || elements.filter((el) => /^ITEM_\d+$/i.test(String(el.slotId || ''))).length
    || 4

  const frame = isThreeCardsHero
    ? agendaThreeCardsGraphicFrame(canvasW, canvasH, { hero: true })
    : isHeroCards
    ? agendaHeroCardsGraphicFrame(canvasW, canvasH)
    : isThreeCards
    ? agendaThreeCardsGraphicFrame(canvasW, canvasH)
    : isNumberedBlocks
    ? agendaNumberedBlocksGraphicFrame(canvasW, canvasH)
    : isNumberedTimeline
    ? agendaNumberedTimelineGraphicFrame(canvasW, canvasH)
    : isMinimalQuiet
    ? agendaMinimalQuietGraphicFrame(canvasW, canvasH)
    : isEditorial
    ? agendaEditorialGraphicFrame(canvasW, canvasH)
    : isAgendaCards
    ? agendaCardsGraphicFrame(canvasW, canvasH)
    : isTwoColRibbon
    ? agendaTwoColumnRibbonGraphicFrame(canvasW, canvasH)
    : isSplitPanel
    ? agendaSplitPanelGraphicFrame(canvasW, canvasH)
    : isTimelineHex
    ? agendaTimelineHexGraphicFrame(canvasW, canvasH)
    : isVerticalRoadmap
    ? agendaVerticalRoadmapGraphicFrame(canvasW, canvasH)
    : isColouredThreeCol
      ? agendaThreeColumnGraphicFrame(canvasW, canvasH)
      : agendaGraphicFrame(canvasW, canvasH)
  const { graphicX, graphicY, graphicW, graphicH, headingY, headingH, heroH } = frame
  const overlay = agendaOverlayPlacements(graphicX, graphicY, graphicW, graphicH, family, variant, { itemCount })
  const columnTextColor = textColor

  const prevBySlot = new Map(
    elements.filter((el) => AGENDA_CHROME_RE.test(String(el.slotId || '')))
      .map((el) => [String(el.slotId || '').toUpperCase(), el])
  )
  const stripped = elements.filter((el) => !AGENDA_CHROME_RE.test(String(el.slotId || '')))
  const filtered = isNumberedTimeline
    ? stripped.filter((el) => isAgendaNumberedTimelineTextSlot(el.slotId))
    : isNumberedBlocks
    ? stripped.filter((el) => isAgendaNumberedBlocksTextSlot(el.slotId))
    : isMinimalQuiet
    ? stripped.filter((el) => isAgendaMinimalQuietTextSlot(el.slotId))
    : isEditorial
    ? stripped.filter((el) => isAgendaEditorialTextSlot(el.slotId))
    : isAgendaCards
    ? stripped.filter((el) => isAgendaCardsTextSlot(el.slotId))
    : isTwoColRibbon
    ? stripped.filter((el) => isAgendaTwoColumnRibbonTextSlot(el.slotId))
    : isSplitPanel
    ? stripped.filter((el) => isAgendaSplitPanelTextSlot(el.slotId))
    : isTimelineHex
    ? stripped.filter((el) => isAgendaTimelineHexTextSlot(el.slotId))
    : isVerticalRoadmap
    ? stripped.filter((el) => isAgendaVerticalRoadmapTextSlot(el.slotId))
    : stacked
    ? stripped.filter((el) => isAgendaThreeColumnTextSlot(el.slotId) || /^HERO_IMAGE$/i.test(String(el.slotId || '')))
    : stripped

  let next = repositionAgendaTextElements(filtered, overlay, {
    textColor,
    columnTextColor,
    isColouredThreeCol,
    isThreeCards,
    isThreeCardsHero,
    isHeroCards,
    isNumberedBlocks,
    isNumberedTimeline,
    isMinimalQuiet,
    isEditorial,
    isAgendaCards,
    isTwoColRibbon,
    isSplitPanel,
    isTimelineHex,
    isVerticalRoadmap,
    headingY,
    headingH,
    canvasW,
  })
  if (isSplitPanel && overlay.hero) {
    next = next.map((el) => {
      if (String(el.slotId || '').toUpperCase() !== 'HERO_IMAGE') return el
      return {
        ...el,
        layer: 2,
        placement: { ...overlay.hero, rotation: 0, opacity: 1 },
        content: {
          ...(el.content || {}),
          clipPath: agendaSplitPanelImageClip(),
          objectFit: 'cover',
          fit: 'cover',
        },
      }
    })
  }
  if (isHeroCards || isThreeCardsHero) {
    const imageH = heroH || Math.round(canvasH * 0.36)
    next = next.map((el) => {
      if (String(el.slotId || '').toUpperCase() !== 'HERO_IMAGE') return el
      return {
        ...el,
        layer: 1,
        placement: { x: 0, y: 0, width: canvasW, height: imageH, rotation: 0, opacity: 1 },
      }
    })
  }

  const chromeSpecs = isRibbonCards
    ? agendaThreeCardsChromeSpecs({ hero: isThreeCardsHero, labels: columnHeadingLabels(stripped) })
    : agendaChromeSpecs(family, variant, itemCount)
  const chrome = injectAgendaChrome(
    chromeSpecs,
    frame,
    palette,
    { prevBySlot, accent, soft, isColouredThreeCol, isThreeCards, isThreeCardsHero, isHeroCards, isNumberedBlocks, isNumberedTimeline, isMinimalQuiet, isEditorial, isAgendaCards, isTwoColRibbon, isSplitPanel, isTimelineHex, isVerticalRoadmap }
  )

  return [...chrome, ...next]
}

export function layoutAgendaMinimal(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

export function layoutAgendaNumbered(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

export function layoutAgendaColumns(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

export function layoutAgendaTimeline(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

export function layoutAgendaTwoColumn(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

/** @deprecated Use family-specific routers; kept for compatibility. */
export function layoutAgendaInfographic(elements, schema, palette, canvas) {
  return layoutAgendaFamily(elements, schema, palette, canvas)
}

export function layoutAgenda(elements, schema, palette, canvas) {
  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId || ''
  const id = String(layoutId).toLowerCase()
  if (/agenda_(minimal|editorial|cards|icon_list)_/.test(id)) return layoutAgendaMinimal(elements, schema, palette, canvas)
  if (/agenda_numbered_/.test(id)) return layoutAgendaNumbered(elements, schema, palette, canvas)
  if (/agenda_three_columns_hero|agenda_three_cards_hero|agenda_three_panel|agenda_three_panels/.test(id)) {
    return layoutAgendaColumns(elements, schema, palette, canvas)
  }
  if (/agenda_three_/.test(id)) return layoutAgendaColumns(elements, schema, palette, canvas)
  if (/agenda_(timeline|vertical_roadmap|progress_path|curved_timeline)_/.test(id)) {
    return layoutAgendaTimeline(elements, schema, palette, canvas)
  }
  if (/agenda_(two_column|split_|asymmetric)_/.test(id)) return layoutAgendaTwoColumn(elements, schema, palette, canvas)
  return layoutAgendaFamily(elements, schema, palette, canvas)
}
