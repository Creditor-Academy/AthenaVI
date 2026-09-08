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
import { isTimelineHorizontalLayout } from './timelineHorizontal.js'
import { isTimelineVerticalLayout } from './timelineVertical.js'
import { isTimelineVerticalCardsLayout } from './timelineVerticalCards.js'
import { isTimelineRoadmapLayout } from './timelineRoadmap.js'
import { isTimelineRoadmapHorizontalLayout } from './timelineRoadmapHorizontal.js'
import { isTimelineProcessStepsHorizontalLayout } from './timelineProcessStepsHorizontal.js'
import { isTimelineProcessHorizontalLayout } from './diagramProcessHorizontal.js'
import { isTimelineHorizontalCardsLayout } from './timelineHorizontalCards.js'
import { isTimelineMilestonesLayout } from './timelineMilestones.js'
import { isTimelineMilestonesCardsLayout } from './timelineMilestonesCards.js'
import { isTimelineMilestonesImageLayout } from './timelineMilestonesImage.js'
import { isTimelineMilestonesImageRightLayout } from './timelineMilestonesImageRight.js'
import { isChartSingleBarLayout } from './chartSingleBar.js'
import { isChartSingleBarSplitLayout } from './chartSingleBarSplit.js'
import { isChartTwoBarLayout } from './chartTwoBar.js'
import { isChartTwoBarSplitLayout } from './chartTwoBarSplit.js'
import { isChartThreeBarLayout } from './chartThreeBar.js'
import { isChartTwoMetricsComparisonLayout } from './chartTwoMetricsComparison.js'
import { isChartTwoCardsLayout } from './chartTwoCards.js'

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
    || isTimelineHorizontalLayout(layoutId)
    || isTimelineHorizontalCardsLayout(layoutId)
    || isTimelineMilestonesLayout(layoutId)
    || isTimelineMilestonesCardsLayout(layoutId)
    || isTimelineMilestonesImageLayout(layoutId)
    || isTimelineMilestonesImageRightLayout(layoutId)
    || isTimelineVerticalLayout(layoutId)
    || isTimelineVerticalCardsLayout(layoutId)
    || isTimelineRoadmapLayout(layoutId)
    || isTimelineRoadmapHorizontalLayout(layoutId)
    || isTimelineProcessStepsHorizontalLayout(layoutId)
    || isTimelineProcessHorizontalLayout(layoutId)
    || isChartSingleBarLayout(layoutId)
    || isChartSingleBarSplitLayout(layoutId)
    || isChartTwoBarLayout(layoutId)
    || isChartTwoBarSplitLayout(layoutId)
    || isChartThreeBarLayout(layoutId)
    || isChartTwoMetricsComparisonLayout(layoutId)
    || isChartTwoCardsLayout(layoutId)
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
