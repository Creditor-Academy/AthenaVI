/**
 * Playfair is used by the presentation editor, not the marketing pages.
 * Import this from editor chunks so the font loads with those screens
 * instead of on every public page.
 */
import { ensureGoogleFontLoaded } from '../../utils/googleFonts.js'

ensureGoogleFontLoaded('Playfair Display')
