import * as cjsModule from '../textNormalize.js';
const cjs = cjsModule.default || cjsModule;

export const {
  stripUnicodeControls,
  sanitizeLineBreaks,
  normalizeStringValue,
  truncateWords,
  truncateChars,
  truncateLines,
  clampSlotText,
  walkNormalizeStrings,
} = cjs;

export default cjs;
