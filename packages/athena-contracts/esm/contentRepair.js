import * as cjsModule from '../contentRepair.js';
const cjs = cjsModule.default || cjsModule;

export const {
  clampRepeatingGroups,
  repairContentForLayout,
  repairContentForLayoutDetailed,
} = cjs;

export default cjs;
