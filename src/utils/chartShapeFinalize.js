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
import { isMetricThreeCardsLayout, layoutMetricThreeCards } from './metricThreeCards.js'
import { isMetricSingleLayout, layoutMetricSingle } from './metricSingle.js'
import { isMetricTwoLayout, layoutMetricTwo } from './metricTwo.js'
import { isMetricSingleSplitLayout, layoutMetricSingleSplit } from './metricSingleSplit.js'
import { isMetricThreeLayout, layoutMetricThree } from './metricThree.js'
import { isMetricTwoSplitLayout, layoutMetricTwoSplit } from './metricTwoSplit.js'
import { isTableSingleLayout, layoutTableSingle } from './tableSingleLayout.js'
import { isTableSingleCardsLayout, layoutTableSingleCards } from './tableSingleCardsLayout.js'
import { isTableWithDescriptionLayout, layoutTableWithDescription } from './tableWithDescriptionLayout.js'
import { isTableWithDescriptionSideLayout, layoutTableWithDescriptionSide } from './tableWithDescriptionSideLayout.js'
import { isTableTwoDescLayout, layoutTableTwoDesc } from './tableTwoDescLayout.js'
import { isTableTwoDescCardsLayout, layoutTableTwoDescCards } from './tableTwoDescCardsLayout.js'
import { isProcessLinearBusinessLayout, layoutProcessLinearBusiness } from './processLinearBusinessLayout.js'

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
  
  if (isMetricThreeCardsLayout(layoutId)) {
    return layoutMetricThreeCards(elements, schema, palette, canvas)
  }
  
  if (isMetricSingleLayout(layoutId)) {
    return layoutMetricSingle(elements, schema, palette, canvas)
  }
  
  if (isMetricTwoLayout(layoutId)) {
    return layoutMetricTwo(elements, schema, palette, canvas)
  }
  
  if (isMetricSingleSplitLayout(layoutId)) {
    return layoutMetricSingleSplit(elements, schema, palette, canvas)
  }
  
  if (isMetricThreeLayout(layoutId)) {
    return layoutMetricThree(elements, schema, palette, canvas)
  }
  
  if (isMetricTwoSplitLayout(layoutId)) {
    return layoutMetricTwoSplit(elements, schema, palette, canvas)
  }
  
  if (isTableSingleLayout(layoutId)) {
    return layoutTableSingle(elements, schema, palette, canvas)
  }
  
  if (isTableSingleCardsLayout(layoutId)) {
    return layoutTableSingleCards(elements, schema, palette, canvas)
  }
  
  if (isTableWithDescriptionLayout(layoutId)) {
    return layoutTableWithDescription(elements, schema, palette, canvas)
  }
  
  if (isTableWithDescriptionSideLayout(layoutId)) {
    return layoutTableWithDescriptionSide(elements, schema, palette, canvas)
  }
  
  if (isTableTwoDescLayout(layoutId)) {
    return layoutTableTwoDesc(elements, schema, palette, canvas)
  }
  
  if (isTableTwoDescCardsLayout(layoutId)) {
    return layoutTableTwoDescCards(elements, schema, palette, canvas)
  }
  
  if (isProcessLinearBusinessLayout(layoutId)) {
    return layoutProcessLinearBusiness(elements, schema, palette, canvas)
  }
  
  return elements
}
