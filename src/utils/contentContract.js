/**
 * Re-exports shared content contract from @athena/contracts.
 */
export {
  deriveContentContract,
  normalizeContentForLayout,
  validateContentForLayout,
  repairContentForLayout,
  assertContentForLayout,
} from '@athena/contracts/contentContract.js'

export { ContentContractValidationError } from '@athena/contracts/errors.js'

export { clampSlotText, normalizeStringValue } from '@athena/contracts/textNormalize.js'

export { textForSlot, coerceSlotText } from '@athena/contracts/slotText.js'
