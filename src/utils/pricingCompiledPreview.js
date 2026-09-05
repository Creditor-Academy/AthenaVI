import { compileDeckLayoutToElements } from './compileDeckLayoutToElements.js'
import { isPricingThreePlansLayout } from './pricingThreePlans.js'
import { isPricingThreePlansFeaturedLayout } from './pricingThreePlansFeatured.js'
import { isPricingThreeHighlightLayout } from './pricingThreeHighlight.js'
import { isPricingThreeHighlightSplitLayout } from './pricingThreeHighlightSplit.js'
import { isPricingFourPlansLayout } from './pricingFourPlans.js'
import { isPricingFourPlansFeaturedLayout } from './pricingFourPlansFeatured.js'
import { isPricingFourParaLayout } from './pricingFourPara.js'
import { isPricingFourParaCardsLayout } from './pricingFourParaCards.js'
import { isPricingComparisonTableLayout } from './pricingComparisonTable.js'
import { isPricingComparisonCardsLayout } from './pricingComparisonCards.js'

export function isCompiledPricingLayout(layoutId) {
  return isPricingThreePlansLayout(layoutId)
    || isPricingThreePlansFeaturedLayout(layoutId)
    || isPricingThreeHighlightLayout(layoutId)
    || isPricingThreeHighlightSplitLayout(layoutId)
    || isPricingFourPlansLayout(layoutId)
    || isPricingFourPlansFeaturedLayout(layoutId)
    || isPricingFourParaLayout(layoutId)
    || isPricingFourParaCardsLayout(layoutId)
    || isPricingComparisonTableLayout(layoutId)
    || isPricingComparisonCardsLayout(layoutId)
}

export function compilePricingLayoutPreviewSlide(schema, aspectRatio = '16:9') {
  if (!schema?.slots?.length || !isCompiledPricingLayout(schema.layout_id || schema.layoutId)) {
    return null
  }
  const canvas = aspectRatio === '4:3'
    ? { width: 1600, height: 1200 }
    : { width: 1920, height: 1080 }
  const elements = compileDeckLayoutToElements(schema, { canvas })
  if (!elements.length) return null
  return {
    elements: { version: 1, canvas, elements },
    backgroundColor: '#ffffff',
  }
}
