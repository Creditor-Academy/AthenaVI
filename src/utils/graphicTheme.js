// Browser-safe ESM entry (avoid loading CJS graphicTheme.js in Vite).
export {
  THEME_PALETTE_SEQUENCE,
  resolvePaletteRole,
  resolvePaletteSequenceIndex,
  graphicContentFromTheme,
  resolveGraphicDisplayColor,
  isThemedColorMode,
} from '../../packages/athena-contracts/esm/graphicTheme.js'
