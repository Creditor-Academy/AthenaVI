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
import { isMetricFourCardsLayout, layoutMetricFourCards } from './metricFourCards.js'
import { isMetricSingleLayout, layoutMetricSingle } from './metricSingle.js'
import { isMetricTwoLayout, layoutMetricTwo } from './metricTwo.js'
import { isMetricSingleSplitLayout, layoutMetricSingleSplit } from './metricSingleSplit.js'
import { isMetricThreeLayout, layoutMetricThree } from './metricThree.js'
import { isMetricFourLayout, layoutMetricFour } from './metricFour.js'
import { isMetricFiveLayout, layoutMetricFive } from './metricFive.js'
import { isMetricFiveCardsLayout, layoutMetricFiveCards } from './metricFiveCards.js'
import { isMetricSixCardsLayout, layoutMetricSixCards } from './metricSixCards.js'
import { isMetricSixParaLayout, layoutMetricSixPara } from './metricSixPara.js'
import {
  isMetricThreeVerticalLayout,
  isMetricThreeVerticalCardsLayout,
  layoutMetricThreeVertical,
  layoutMetricThreeVerticalCards,
} from './metricThreeVertical.js'
import { isMetricTwoSplitLayout, layoutMetricTwoSplit } from './metricTwoSplit.js'
import { isTableSingleLayout, layoutTableSingle } from './tableSingleLayout.js'
import { isTableSingleCardsLayout, layoutTableSingleCards } from './tableSingleCardsLayout.js'
import { isTableWithDescriptionLayout, layoutTableWithDescription } from './tableWithDescriptionLayout.js'
import { isTableWithDescriptionSideLayout, layoutTableWithDescriptionSide } from './tableWithDescriptionSideLayout.js'
import { isTableTwoDescLayout, layoutTableTwoDesc } from './tableTwoDescLayout.js'
import { isTableTwoDescCardsLayout, layoutTableTwoDescCards } from './tableTwoDescCardsLayout.js'
import { isProcessLinearBusinessLayout, layoutProcessLinearBusiness } from './processLinearBusinessLayout.js'
import { isProcessLinearHortiLayout, layoutProcessLinearHorti } from './processLinearHortiLayout.js'
import { isProcessLinearHorizontalLayout, layoutProcessLinearHorizontal } from './processLinearHorizontalLayout.js'
import { isProcessLinearHortiFourLayout, layoutProcessLinearHortiFour } from './processLinearHortiFourLayout.js'
import { isProcessLinearFourCardsLayout, layoutProcessLinearFourCards } from './processLinearFourCardsLayout.js'
import { isProcessLinearNumericLayout, layoutProcessLinearNumeric } from './processLinearNumericLayout.js'
import { isProcessLinearNumericCardsLayout, layoutProcessLinearNumericCards } from './processLinearNumericCardsLayout.js'
import {
  isTableTwoSameHeaderLayout,
  layoutTableTwoSameHeader,
  isTableTwoSameHeaderCardsLayout,
  layoutTableTwoSameHeaderCards,
} from './tableTwoSameHeaderLayout.js'
import {
  isEightShortTextsImageLayout,
  layoutEightShortTextsImage,
} from './eightShortTextsImageLayout.js'
import {
  isBulletListDenseLayout,
  layoutBulletListDense,
} from './bulletListDenseLayout.js'
import {
  isBulletListNumberedLayout,
  layoutBulletListNumbered,
} from './bulletListNumberedLayout.js'
import {
  isBulletListTwoColumnLayout,
  layoutBulletListTwoColumn,
} from './bulletListTwoColumnLayout.js'
import {
  isTextOnlyCenteredLayout,
  layoutTextOnlyCentered,
} from './textOnlyCenteredLayout.js'
import {
  isSectionDividerSplitDiagonalLayout,
  layoutSectionDividerSplitDiagonal,
} from './sectionDividerSplitDiagonalLayout.js'
import {
  isSectionDividerSplitLayout,
  layoutSectionDividerSplit,
} from './sectionDividerSplitLayout.js'
import {
  isBulletListSplitLayout,
  layoutBulletListSplit,
} from './bulletListSplitLayout.js'
import {
  isBulletListNumberedVerticalLayout,
  layoutBulletListNumberedVertical,
} from './bulletListNumberedVerticalLayout.js'
import {
  isIntroThreeParaIconsLayout,
  layoutIntroThreeParaIcons,
} from './introThreeParaIconsLayout.js'
import {
  isWideImageStatementOverlayLayout,
  layoutWideImageStatementOverlay,
} from './wideImageStatementOverlayLayout.js'
import {
  isGridBentoThreeLayout,
  layoutGridBentoThree,
} from './gridBentoThreeLayout.js'
import {
  isGridBentoFourLayout,
  layoutGridBentoFour,
} from './gridBentoFourLayout.js'
import {
  isGridFourMosaicLayout,
  layoutGridFourMosaic,
} from './gridFourMosaicLayout.js'
import {
  isGridSixImagesLayout,
  layoutGridSixImages,
} from './gridSixImagesLayout.js'
import {
  isGridSixImagesMosaicLayout,
  layoutGridSixImagesMosaic,
} from './gridSixImagesMosaicLayout.js'
import {
  isGridTextImageCardsLayout,
  layoutGridTextImageCards,
} from './gridTextImageCardsLayout.js'
import {
  isLogoPartnerGridLayout,
  layoutLogoPartnerGrid,
  isLogoPartnerStripLayout,
  layoutLogoPartnerStrip,
  isLogoWallLayout,
  layoutLogoWall,
} from './logoPartnerLayouts.js'
import {
  isLogoWallMasonryLayout,
  layoutLogoWallMasonry,
} from './logoWallMasonryLayout.js'
import {
  isGridThreeImagesTextLayout,
  layoutGridThreeImagesText,
} from './gridThreeImagesText.js'
import {
  isGridThreeImagesTextAsymmetricLayout,
  layoutGridThreeImagesTextAsymmetric,
} from './gridThreeImagesTextAsymmetric.js'
import {
  isGridImagesTextCardsLayout,
  layoutGridImagesTextCards,
} from './gridImagesTextCards.js'
import {
  isGridImagesTextMosaicLayout,
  layoutGridImagesTextMosaic,
} from './gridImagesTextMosaic.js'
import {
  isGridInsightsChartLayout,
  layoutGridInsightsChart,
} from './gridInsightsChart.js'
import {
  isGridInsightsChartSplitLayout,
  layoutGridInsightsChartSplit,
} from './gridInsightsChartSplit.js'
import {
  isGridMetricsMobileLayout,
  layoutGridMetricsMobile,
} from './gridMetricsMobile.js'
import {
  isGridMetricsMasonryLayout,
  layoutGridMetricsMasonry,
} from './gridMetricsMasonry.js'
import {
  isGridMetricsAsymmetricLayout,
  layoutGridMetricsAsymmetric,
} from './gridMetricsAsymmetric.js'
import {
  isGridDeviceMockupsLayout,
  layoutGridDeviceMockups,
} from './gridDeviceMockupsLayout.js'
import {
  isChartExponentialDescLayout,
  layoutChartExponentialDesc,
} from './chartExponentialDescLayout.js'
import {
  isChartWithDescriptionLayout,
  layoutChartWithDescription,
} from './chartWithDescriptionLayout.js'

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
  
  if (isMetricFourLayout(layoutId)) {
    return layoutMetricFour(elements, schema, palette, canvas)
  }
  
  if (isMetricFourCardsLayout(layoutId)) {
    return layoutMetricFourCards(elements, schema, palette, canvas)
  }
  
  if (isMetricFiveLayout(layoutId)) {
    return layoutMetricFive(elements, schema, palette, canvas)
  }
  
  if (isMetricFiveCardsLayout(layoutId)) {
    return layoutMetricFiveCards(elements, schema, palette, canvas)
  }
  
  if (isMetricSixCardsLayout(layoutId, schema)) {
    return layoutMetricSixCards(elements, schema, palette, canvas)
  }
  
  if (isMetricSixParaLayout(layoutId, schema)) {
    return layoutMetricSixPara(elements, schema, palette, canvas)
  }
  
  if (isMetricThreeVerticalCardsLayout(layoutId, schema)) {
    return layoutMetricThreeVerticalCards(elements, schema, palette, canvas)
  }

  if (isMetricThreeVerticalLayout(layoutId, schema)) {
    return layoutMetricThreeVertical(elements, schema, palette, canvas)
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
  
  if (isProcessLinearHortiLayout(layoutId)) {
    return layoutProcessLinearHorti(elements, schema, palette, canvas)
  }

  if (isProcessLinearHortiFourLayout(layoutId)) {
    return layoutProcessLinearHortiFour(elements, schema, palette, canvas)
  }

  if (isProcessLinearFourCardsLayout(layoutId)) {
    return layoutProcessLinearFourCards(elements, schema, palette, canvas)
  }

  if (isProcessLinearNumericLayout(layoutId)) {
    return layoutProcessLinearNumeric(elements, schema, palette, canvas)
  }

  if (isProcessLinearNumericCardsLayout(layoutId)) {
    return layoutProcessLinearNumericCards(elements, schema, palette, canvas)
  }

  if (isProcessLinearHorizontalLayout(layoutId)) {
    return layoutProcessLinearHorizontal(elements, schema, palette, canvas)
  }

  if (isProcessLinearBusinessLayout(layoutId)) {
    return layoutProcessLinearBusiness(elements, schema, palette, canvas)
  }
  
  if (isTableTwoSameHeaderCardsLayout(layoutId)) {
    return layoutTableTwoSameHeaderCards(elements, schema, palette, canvas)
  }

  if (isTableTwoSameHeaderLayout(layoutId)) {
    return layoutTableTwoSameHeader(elements, schema, palette, canvas)
  }
  
  if (isEightShortTextsImageLayout(layoutId)) {
    return layoutEightShortTextsImage(elements, schema, palette, canvas)
  }

  if (isBulletListDenseLayout(layoutId)) {
    return layoutBulletListDense(elements, schema, palette, canvas)
  }

  if (isBulletListNumberedVerticalLayout(layoutId)) {
    return layoutBulletListNumberedVertical(elements, schema, palette, canvas)
  }

  if (isBulletListNumberedLayout(layoutId)) {
    return layoutBulletListNumbered(elements, schema, palette, canvas)
  }

  if (isBulletListSplitLayout(layoutId)) {
    return layoutBulletListSplit(elements, schema, palette, canvas)
  }

  if (isBulletListTwoColumnLayout(layoutId)) {
    return layoutBulletListTwoColumn(elements, schema, palette, canvas)
  }

  if (isTextOnlyCenteredLayout(layoutId)) {
    return layoutTextOnlyCentered(elements, schema, palette, canvas)
  }

  if (isSectionDividerSplitDiagonalLayout(layoutId)) {
    return layoutSectionDividerSplitDiagonal(elements, schema, palette, canvas)
  }

  if (isSectionDividerSplitLayout(layoutId)) {
    return layoutSectionDividerSplit(elements, schema, palette, canvas)
  }
  
  if (isIntroThreeParaIconsLayout(layoutId)) {
    return layoutIntroThreeParaIcons(elements, schema, palette, canvas)
  }

  if (isWideImageStatementOverlayLayout(layoutId, schema)) {
    return layoutWideImageStatementOverlay(elements, schema, palette, canvas)
  }
  
  if (isGridBentoThreeLayout(layoutId)) {
    return layoutGridBentoThree(elements, schema, palette, canvas)
  }
  
  if (isGridBentoFourLayout(layoutId)) {
    return layoutGridBentoFour(elements, schema, palette, canvas)
  }
  
  if (isGridFourMosaicLayout(layoutId)) {
    return layoutGridFourMosaic(elements, schema, palette, canvas)
  }
  
  if (isGridSixImagesLayout(layoutId)) {
    return layoutGridSixImages(elements, schema, palette, canvas)
  }
  
  if (isGridSixImagesMosaicLayout(layoutId)) {
    return layoutGridSixImagesMosaic(elements, schema, palette, canvas)
  }
  
  if (isGridTextImageCardsLayout(layoutId)) {
    return layoutGridTextImageCards(elements, schema, palette, canvas)
  }
  
  if (isLogoPartnerGridLayout(layoutId)) {
    return layoutLogoPartnerGrid(elements, schema, palette, canvas)
  }
  
  if (isLogoPartnerStripLayout(layoutId)) {
    return layoutLogoPartnerStrip(elements, schema, palette, canvas)
  }
  
  if (isLogoWallLayout(layoutId)) {
    return layoutLogoWall(elements, schema, palette, canvas)
  }
  
  if (isLogoWallMasonryLayout(layoutId)) {
    return layoutLogoWallMasonry(elements, schema, palette, canvas)
  }
  
  if (isGridThreeImagesTextLayout(layoutId)) {
    return layoutGridThreeImagesText(elements, schema, palette, canvas)
  }
  
  if (isGridThreeImagesTextAsymmetricLayout(layoutId)) {
    return layoutGridThreeImagesTextAsymmetric(elements, schema, palette, canvas)
  }
  
  if (isGridImagesTextCardsLayout(layoutId)) {
    return layoutGridImagesTextCards(elements, schema, palette, canvas)
  }
  
  if (isGridImagesTextMosaicLayout(layoutId)) {
    return layoutGridImagesTextMosaic(elements, schema, palette, canvas)
  }
  
  if (isGridInsightsChartLayout(layoutId)) {
    return layoutGridInsightsChart(elements, schema, palette, canvas)
  }
  
  if (isGridInsightsChartSplitLayout(layoutId)) {
    return layoutGridInsightsChartSplit(elements, schema, palette, canvas)
  }
  
  if (isGridMetricsMobileLayout(layoutId)) {
    return layoutGridMetricsMobile(elements, schema, palette, canvas)
  }
  
  if (isGridMetricsMasonryLayout(layoutId)) {
    return layoutGridMetricsMasonry(elements, schema, palette, canvas)
  }
  
  if (isGridMetricsAsymmetricLayout(layoutId)) {
    return layoutGridMetricsAsymmetric(elements, schema, palette, canvas)
  }
  
  if (isGridDeviceMockupsLayout(layoutId)) {
    return layoutGridDeviceMockups(elements, schema, palette, canvas)
  }
  
  if (isChartExponentialDescLayout(layoutId)) {
    return layoutChartExponentialDesc(elements, schema, palette, canvas)
  }
  
  if (isChartWithDescriptionLayout(layoutId)) {
    return layoutChartWithDescription(elements, schema, palette, canvas)
  }
  
  return elements
}
