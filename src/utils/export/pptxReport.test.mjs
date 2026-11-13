#!/usr/bin/env node
/** Run: node scripts/run-tests.mjs src/utils/export/pptxReport.test.mjs */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { pptxReportLines } from './pptxReport.js'

const report = {
  editable: 24,
  pictures: [
    { label: 'icons and graphics', count: 3 },
    { label: 'photo filters', count: 1 },
  ],
  missing: 1,
  fonts: ['Inter', 'Nunito'],
  fontsMissing: ['Clash Display'],
  groups: 2,
  grownText: 1,
}

describe('what a PowerPoint export contains', () => {
  it('says what stays editable, what became a picture and why, groups, grown text and fonts', () => {
    assert.deepEqual(
      pptxReportLines(report).map((l) => l.text),
      [
        '24 items stay editable in PowerPoint',
        "Kept as pictures, which PowerPoint can't edit: icons and graphics (3), photo filters (1)",
        '2 groups kept together',
        '1 text box was made taller so all its text shows',
        'Fonts included: Inter, Nunito',
        'Not included: Clash Display. PowerPoint will use a similar font.',
        "1 picture couldn't be loaded and was left out",
      ]
    )
  })

  it('for Google Slides: names the app and leaves out fonts (Slides uses Google Fonts by name)', () => {
    const lines = pptxReportLines(report, 'google-slides').map((l) => l.text)
    assert.equal(lines[0], '24 items stay editable in Google Slides')
    assert.ok(!lines.some((l) => l.startsWith('Fonts')))
  })

  it('nothing to say without a report (older exports)', () => {
    assert.deepEqual(pptxReportLines(null), [])
    assert.deepEqual(pptxReportLines({ editable: 1 }).map((l) => l.text), ['1 item stays editable in PowerPoint'])
  })
})
