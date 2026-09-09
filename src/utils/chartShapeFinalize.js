import { isChartSingleBarLayout, layoutChartSingleBar } from './chartSingleBar.js'
import { isChartSingleBarSplitLayout, layoutChartSingleBarSplit } from './chartSingleBarSplit.js'
import { isChartTwoBarLayout, layoutChartTwoBar } from './chartTwoBar.js'
import { isChartTwoBarSplitLayout, layoutChartTwoBarSplit } from './chartTwoBarSplit.js'
import { isChartThreeBarLayout, layoutChartThreeBar } from './chartThreeBar.js'
import { isChartTwoMetricsComparisonLayout, layoutChartTwoMetricsComparison } from './chartTwoMetricsComparison.js'
import { isChartTwoCardsLayout, layoutChartTwoCards } from './chartTwoCards.js'
import { isChartThreeCardsLayout, layoutChartThreeCards } from './chartThreeCards.js'
import { isChartThreeContextLayout, layoutChartThreeContext } from './chartThreeContext.js'
import { isChartThreeContextCardsLayout, layoutChartThreeContextCards } from './chartThreeContextCards.js'
import { isChartDonutContextLayout, layoutChartDonutContext } from './chartDonutContext.js'

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
  
  if (isChartThreeCardsLayout(layoutId)) {
    return layoutChartThreeCards(elements, schema, palette, canvas)
  }
  
  if (isChartThreeContextLayout(layoutId)) {
    return layoutChartThreeContext(elements, schema, palette, canvas)
  }
  
  if (isChartThreeContextCardsLayout(layoutId)) {
    return layoutChartThreeContextCards(elements, schema, palette, canvas)
  }
  
  if (isChartDonutContextLayout(layoutId)) {
    return layoutChartDonutContext(elements, schema, palette, canvas)
  }
  
  return elements
}
