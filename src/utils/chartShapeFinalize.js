import { isChartSingleBarLayout, layoutChartSingleBar } from './chartSingleBar.js'
import { isChartSingleBarSplitLayout, layoutChartSingleBarSplit } from './chartSingleBarSplit.js'
import { isChartTwoBarLayout, layoutChartTwoBar } from './chartTwoBar.js'
import { isChartTwoBarSplitLayout, layoutChartTwoBarSplit } from './chartTwoBarSplit.js'
import { isChartThreeBarLayout, layoutChartThreeBar } from './chartThreeBar.js'
import { isChartTwoMetricsComparisonLayout, layoutChartTwoMetricsComparison } from './chartTwoMetricsComparison.js'
import { isChartTwoCardsLayout, layoutChartTwoCards } from './chartTwoCards.js'

export function finalizeChartShapes(elements, schema, palette = {}, canvas = {}) {
  const layoutId = schema?.layout_id || schema?.id || schema?.layoutId
  
  if (isChartSingleBarLayout(layoutId)) {
    return layoutChartSingleBar(elements, schema, palette, canvas)
  }
  
  if (isChartSingleBarSplitLayout(layoutId)) {
    return layoutChartSingleBarSplit(elements, schema, palette, canvas)
  }
  
  if (isChartTwoBarLayout(layoutId)) {
    return layoutChartTwoBar(elements, schema, palette, canvas)
  }
  
  if (isChartTwoBarSplitLayout(layoutId)) {
    return layoutChartTwoBarSplit(elements, schema, palette, canvas)
  }
  
  if (isChartThreeBarLayout(layoutId)) {
    return layoutChartThreeBar(elements, schema, palette, canvas)
  }
  
  if (isChartTwoMetricsComparisonLayout(layoutId)) {
    return layoutChartTwoMetricsComparison(elements, schema, palette, canvas)
  }
  
  if (isChartTwoCardsLayout(layoutId)) {
    return layoutChartTwoCards(elements, schema, palette, canvas)
  }
  
  return elements
}
