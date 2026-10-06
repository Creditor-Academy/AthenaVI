import * as cjsModule from '../slotText.js';
const cjs = cjsModule.default || cjsModule;

export const {
  textForSlot,
  coerceSlotText,
  itemToText,
  itemsToTexts,
  bulletsOf,
  bulletBlock,
  isMainTitleSlot,
  chartForSlot,
  chartDatasetAt,
  sampleChartDataset,
  isChartElementSlot,
  resolveChartTypeForSlot,
  applyRichBulletsToTextContent,
} = cjs;

export default cjs;
