import * as cjsModule from '../contentContract.js';
const cjs = cjsModule.default || cjsModule;

export const {
  CHARS_PER_WORD,
  WORDS_PER_LINE,
  deriveContentContract,
  normalizeContentForLayout,
  validateContentForLayout,
  validateContentForLayoutSoft,
  repairContentForLayout,
  repairContentForLayoutDetailed,
  clampRepeatingGroups,
  assertContentForLayout,
} = cjs;

export default cjs;
