#!/usr/bin/env node
/** Sync FE agenda SVG/finalize modules → BE diagrams/ (CommonJS). */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const feRoot = join(__dirname, '../src/utils')
const beRoot = join(__dirname, '../../AthenaVI_backend/src/modules/presentation/diagrams')

const FILES = [
  'agendaSharedSvg.js',
  'agendaMinimalSvg.js',
  'agendaNumberedSvg.js',
  'agendaColumnsSvg.js',
  'agendaTimelineSvg.js',
  'agendaTwoColumnSvg.js',
  'agendaInfographicSvg.js',
]

function toCjs(src, name) {
  let out = src
    .replace(/^import \{([^}]+)\} from '\.\/([^']+)';?\s*$/gm, (_, names, mod) => {
      const req = mod === 'timelineProcessSvg.js' ? '../timelineProcessSvg' : `./${mod.replace(/\.js$/, '')}`
      return `const {${names}} = require('${req}');`
    })
    .replace(/^import \{([^}]+)\} from '\.\/([^']+)'\s*$/gm, (_, names, mod) => {
      const req = mod === 'timelineProcessSvg.js' ? '../timelineProcessSvg' : `./${mod.replace(/\.js$/, '')}`
      return `const {${names}} = require('${req}');`
    })
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export \{[\s\S]*?\};?\s*$/m, '')

  const exports = []
  const exportMatch = src.match(/^export \{([\s\S]*?)\};?\s*$/m)
  if (exportMatch) {
    exportMatch[1].split(',').forEach((line) => {
      const name = line.trim().split(/\s+as\s+/)[0].trim()
      if (name) exports.push(name)
    })
  } else {
    const fnMatches = [...out.matchAll(/^function (agenda\w+)/gm)]
    const constMatches = [...out.matchAll(/^const (AGENDA_\w+)/gm)]
    fnMatches.forEach((m) => exports.push(m[1]))
    constMatches.forEach((m) => exports.push(m[1]))
  }

  const unique = [...new Set(exports.filter(Boolean))]
  if (unique.length) {
    out += `\nmodule.exports = {\n  ${unique.join(',\n  ')},\n};\n`
  }
  return out
}

mkdirSync(beRoot, { recursive: true })
for (const file of FILES) {
  const src = readFileSync(join(feRoot, file), 'utf8')
  writeFileSync(join(beRoot, file), toCjs(src, file))
  console.log('synced', file)
}

// agendaThreeColumn stays FE-only path; copy from FE utils if newer
writeFileSync(
  join(beRoot, 'agendaThreeColumn.js'),
  readFileSync(join(feRoot, 'agendaThreeColumn.js'), 'utf8')
    .replace(/^export /gm, '')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    + `\nmodule.exports = {
  AGENDA_THREE_COLUMN_GEOM,
  DEFAULT_COLUMN_PALETTE,
  agendaThreeColumnGraphicFrame,
  agendaThreeColumnRuleInlineSvg,
  agendaThreeColumnIconInlineSvg,
  agendaThreeColumnNumberInlineSvg,
  colouredColumnTextContent,
  agendaThreeColumnChromeSpecs,
  agendaThreeColumnOverlayPlacements,
  agendaThreeColumnPreviewSvg,
  specToThreeColumnContent,
  isAgendaThreeColumnColouredLayout,
  isAgendaThreeColumnTextSlot,
};\n`
)
console.log('synced agendaThreeColumn.js')
