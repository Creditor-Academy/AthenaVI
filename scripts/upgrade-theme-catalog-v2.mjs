#!/usr/bin/env node
/** Add schemaVersion 2 overlay tokens to themes/catalog.json */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, '../../AthenaVI_backend/src/modules/presentation/themes/catalog.json')
const themes = JSON.parse(readFileSync(file, 'utf8'))

const DARK_IDS = new Set(['midnight_blue', 'forest_slate', 'charcoal_gold', 'violet_noir', 'sunset_coral'])

const META = {
  midnight_blue: { tags: ['corporate', 'dark'], useCases: ['pitch', 'product'], mood: 'confident' },
  clean_light: { tags: ['minimal', 'light'], useCases: ['pitch', 'saas'], mood: 'clear' },
  forest_slate: { tags: ['nature', 'dark'], useCases: ['product', 'report'], mood: 'grounded' },
  warm_sand: { tags: ['editorial', 'light'], useCases: ['brand', 'story'], mood: 'warm' },
  charcoal_gold: { tags: ['luxury', 'dark'], useCases: ['pitch', 'brand'], mood: 'premium' },
  ocean_mist: { tags: ['calm', 'light'], useCases: ['product', 'health'], mood: 'serene' },
  violet_noir: { tags: ['tech', 'dark'], useCases: ['pitch', 'product'], mood: 'bold' },
  paper_ink: { tags: ['editorial', 'light'], useCases: ['report', 'story'], mood: 'classic' },
  sunset_coral: { tags: ['lifestyle', 'dark'], useCases: ['brand', 'pitch'], mood: 'vivid' },
  mint_clinic: { tags: ['health', 'light'], useCases: ['wellness', 'product'], mood: 'fresh' },
}

for (const theme of themes) {
  const appearance = DARK_IDS.has(theme.id) ? 'dark' : 'light'
  const tt = theme.themeTokens || {}
  tt.schemaVersion = 2
  tt.appearance = appearance
  tt.palette = {
    ...tt.palette,
    textOnImage: '#FFFFFF',
    textOnImageMuted: 'rgba(255,255,255,0.85)',
    overlayScrim: appearance === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.45)',
  }
  tt.overlayDefaults = {
    backgroundStyle: 'image',
    overlayOpacity: 0.45,
    textContrast: 'high',
  }
  tt.shapeDefaults = {
    cardBorderRadius: 12,
    accentBarWidth: 8,
  }
  tt.meta = META[theme.id] || { tags: [appearance], useCases: ['pitch'], mood: 'neutral' }
  theme.themeTokens = tt
}

writeFileSync(file, `${JSON.stringify(themes, null, 2)}\n`)
console.log(`Upgraded ${themes.length} themes in catalog.json`)
